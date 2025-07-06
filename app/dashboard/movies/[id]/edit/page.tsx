import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { MovieForm } from "@/components/movies/movie-form"

interface EditMoviePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditMoviePageProps): Promise<Metadata> {
  const awaitedParams = await params;
  const movie = await prisma.movie.findUnique({ where: { id: awaitedParams.id } })

  if (!movie) {
    return {
      title: "Movie Not Found",
    }
  }

  return {
    title: `Edit ${movie.title}`,
    description: `Edit movie details for ${movie.title}`,
  }
}

export default async function EditMoviePage({ params }: EditMoviePageProps) {
  // Fetch movie using Prisma
  const awaitedParams = await params;
  const movie = await prisma.movie.findUnique({
    where: { id: awaitedParams.id },
    include: { genres: true }
  })
  if (!movie) return notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Movie</h1>
        <p className="text-muted-foreground">Update movie details for {movie.title}</p>
      </div>

      <div className="mx-auto max-w-3xl">
        <MovieForm movie={movie} />
      </div>
    </div>
  )
}
