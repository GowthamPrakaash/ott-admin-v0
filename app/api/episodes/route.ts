import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
    try {
        const episodes = await prisma.episode.findMany({
            select: { id: true, title: true },
            orderBy: { title: "asc" },
        })
        return NextResponse.json(episodes)
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch episodes" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    if (!(await isAdmin(req))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    try {
        const data = await req.json()
        const created = await prisma.episode.create({ data })
        return NextResponse.json(created)
    } catch (e) {
        return NextResponse.json({ error: "Failed to create episode" }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    if (!(await isAdmin(req))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    try {
        const { id, ...data } = await req.json()
        const updated = await prisma.episode.update({ where: { id }, data })
        return NextResponse.json(updated)
    } catch (e) {
        return NextResponse.json({ error: "Failed to update episode" }, { status: 500 })
    }
}
