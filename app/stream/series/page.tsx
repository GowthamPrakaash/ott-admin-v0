import { prisma } from "@/lib/prisma"
import { ContentGrid } from "@/components/stream/content-grid"

export const metadata = {
  title: "Series | Apsara Streaming",
  description: "Browse all series on Apsara Streaming",
}

export default async function SeriesPage() {
  // Fetch all published series
  const series = await prisma.series.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    include: { genres: true },
  })

  // Fetch genres for filtering
  const genres = await prisma.genre.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Series</h1>
      <ContentGrid items={series} type="series" genres={genres.map((g) => g.name)} />
    </div>
  )
}
