import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const body = await req.json()
    const { movieId, seriesId, episodeId } = body
    if (!movieId && !seriesId && !episodeId) {
        return NextResponse.json({ error: 'Missing content id' }, { status: 400 })
    }
    const history = await prisma.watchHistory.create({
        data: {
            userId: user.id,
            movieId,
            seriesId,
            episodeId,
        },
    })
    return NextResponse.json({ success: true, history })
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const recentRaw = await prisma.watchHistory.findMany({
        where: { userId: user.id },
        orderBy: { watchedAt: 'desc' },
        include: {
            movie: true,
            series: true,
            episode: true,
        },
    })

    // Filter to get only unique movie, series, or episode (by their IDs), keeping the most recent
    const seen = new Set<string>()
    const recent = recentRaw.filter(entry => {
        const key =
            entry.movieId?.toString() ||
            entry.seriesId?.toString() ||
            entry.episodeId?.toString()
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
    }).slice(0, 10)
    return NextResponse.json({ recent })
}
