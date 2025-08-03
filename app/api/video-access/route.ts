import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, canWatchVideos } from '@/lib/auth'

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const canWatch = await canWatchVideos(session.user.email)

    return NextResponse.json({
        canWatch,
        message: canWatch ? 'Access granted' : 'Subscription required'
    })
}