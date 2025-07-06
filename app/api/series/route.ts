import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
    try {
        const series = await prisma.series.findMany({
            orderBy: { title: "asc" },
            include: { genres: true },
        })
        return NextResponse.json(series)
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch series" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    if (!(await isAdmin(req))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    try {
        const data = await req.json()
        const { genres, ...seriesData } = data
        const created = await prisma.series.create({
            data: {
                ...seriesData,
                genres: {
                    connect: genres.map((id: string) => ({ id })),
                },
            },
            include: { genres: true },
        })
        return NextResponse.json(created)
    } catch (e) {
        return NextResponse.json({ error: "Failed to create series" }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    if (!(await isAdmin(req))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    try {
        const { id, genres, ...seriesData } = await req.json()
        const updated = await prisma.series.update({
            where: { id },
            data: {
                ...seriesData,
                genres: {
                    set: genres.map((id: string) => ({ id })),
                },
            },
            include: { genres: true },
        })
        return NextResponse.json(updated)
    } catch (e) {
        return NextResponse.json({ error: "Failed to update series" }, { status: 500 })
    }
}
