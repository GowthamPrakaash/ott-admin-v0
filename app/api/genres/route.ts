import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
    try {
        const genres = await prisma.genre.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        })
        return NextResponse.json(genres)
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch genres" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    if (!(await isAdmin(req))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    try {
        const data = await req.json()
        const created = await prisma.genre.create({ data })
        return NextResponse.json(created)
    } catch (e) {
        return NextResponse.json({ error: "Failed to create genre" }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    if (!(await isAdmin(req))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    try {
        const { id, ...data } = await req.json()
        const updated = await prisma.genre.update({ where: { id }, data })
        return NextResponse.json(updated)
    } catch (e) {
        return NextResponse.json({ error: "Failed to update genre" }, { status: 500 })
    }
}
