import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    const url = new URL(req.url)
    const q = url.searchParams.get("q") || ""
    if (!q.trim()) return NextResponse.json([])
    const [movies, series] = await Promise.all([
        prisma.movie.findMany({
            where: {
                status: "published",
                title: { contains: q, mode: "insensitive" },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
        }),
        prisma.series.findMany({
            where: {
                status: "published",
                title: { contains: q, mode: "insensitive" },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
        }),
    ])
    const results = [
        ...movies.map((item) => ({ ...item, contentType: "movie" })),
        ...series.map((item) => ({ ...item, contentType: "series" })),
    ]
    return NextResponse.json(results)
}
