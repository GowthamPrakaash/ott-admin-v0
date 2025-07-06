import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/auth"

export async function GET(req: Request) {
    const url = new URL(req.url)
    const status = url.searchParams.get("status")
    let where = {}
    if (status && (status === "published" || status === "draft")) {
        where = { status }
    }
    const movies = await prisma.movie.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { genres: true },
    })
    return NextResponse.json(movies)
}

export async function POST(req: NextRequest) {
    if (!(await isAdmin(req))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    try {
        const data = await req.json()
        const { genres, ...movieData } = data
        const movie = await prisma.movie.create({
            data: {
                ...movieData,
                genres: {
                    connect: genres.map((id: string) => ({ id })),
                },
            },
            include: { genres: true },
        })
        return NextResponse.json(movie)
    } catch (e) {
        return NextResponse.json({ error: "Failed to create movie" }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    if (!(await isAdmin(req))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    try {
        const { id, genres, ...movieData } = await req.json()
        const movie = await prisma.movie.update({
            where: { id },
            data: {
                ...movieData,
                genres: {
                    set: genres.map((id: string) => ({ id })),
                },
            },
            include: { genres: true },
        })
        return NextResponse.json(movie)
    } catch (e) {
        return NextResponse.json({ error: "Failed to update movie" }, { status: 500 })
    }
}
