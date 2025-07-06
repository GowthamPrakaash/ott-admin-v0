import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Clock, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContentSlider } from "@/components/stream/content-slider"
import { prisma } from "@/lib/prisma"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const awaitedParams = await params
  const movie = await prisma.movie.findUnique({
    where: { id: awaitedParams.id },
    select: { title: true, meta_title: true },
  })
  if (!movie) {
    return { title: "Movie Not Found" }
  }
  return { title: `${movie.meta_title || movie.title} | Apsara Streaming` }
}

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const awaitedParams = await params
  const movie = await prisma.movie.findFirst({
    where: { id: awaitedParams.id, status: "published" },
    include: { genres: true },
  })
  if (!movie) notFound()
  const similarMovies = await prisma.movie.findMany({
    where: {
      status: "published",
      genres: {
        some: {
          id: { in: movie.genres.map((g) => g.id) },
        },
      },
      id: { not: awaitedParams.id }
    },
    take: 10,
  })
  return (
    <div>
      {/* Hero section */}
      <div className="relative h-[50vh] md:h-[70vh] w-full">
        <Image src={movie.poster_url || "/placeholder.svg"} alt={movie.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold">{movie.title}</h1>
          <div className="flex items-center gap-4 text-sm">
            <span>{movie.release_year}</span>
            {movie.genres && movie.genres.length > 0 && (
              <span className="flex gap-1 flex-wrap">
                {movie.genres.map((genre) => (
                  <span key={genre.id} className="bg-white/20 px-2 py-1 rounded text-xs">
                    {genre.name}
                  </span>
                ))}
              </span>
            )}
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              <span>
                {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
              </span>
            </div>
          </div>
          <p className="text-lg max-w-2xl">{movie.description}</p>
          <div className="pt-4">
            <Button asChild size="lg">
              <Link href={`/stream/watch/movie/${movie.id}`}>
                <Play className="mr-2 h-5 w-5" /> Play
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="container px-4 py-8 space-y-12">
        {/* Similar Movies */}
        {similarMovies && similarMovies.length > 0 && (
          <ContentSlider title="More Like This" items={similarMovies} type="movie" />
        )}
      </div>
    </div>
  )
}
