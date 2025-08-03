import { prisma } from "@/lib/prisma"
import { ContentGrid } from "@/components/stream/content-grid"

export const metadata = {
  title: "Movies | Apsara Entertainment",
  description: "Browse all movies on Apsara Entertainment",
}

export default async function MoviesPage() {
  // Fetch all published movies
  const movies = await prisma.movie.findMany({
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
      <h1 className="text-3xl font-bold mb-8">Movies</h1>
      <ContentGrid items={movies} type="movie" genres={genres.map((g) => g.name)} />
    </div>
  )
}
