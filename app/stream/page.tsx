import Link from "next/link"
import Image from "next/image"
import { Play, Info } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { ContentSlider } from "@/components/stream/content-slider"
import { RecentWatchHistory } from "@/components/stream/recent-watch-history"

export default async function StreamPage() {
  // Fetch featured content (latest movie)
  const featuredMovie = await prisma.movie.findFirst({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    include: { genres: true },
  })
  // Fetch latest movies
  const latestMovies = await prisma.movie.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { genres: true },
  })
  // Fetch latest series
  const latestSeries = await prisma.series.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { genres: true },
  })
  return (
    <div className="space-y-12">
      {/* Hero section with featured content */}
      {featuredMovie && (
        <div className="relative h-[70vh] w-full">
          <Image
            src={featuredMovie.poster_url || "/placeholder.svg"}
            alt={featuredMovie.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold">{featuredMovie.title}</h1>
            <p className="text-lg max-w-2xl line-clamp-2">{featuredMovie.description}</p>
            <div className="flex gap-4 pt-4">
              <Button asChild size="lg">
                <Link href={`/stream/watch/movie/${featuredMovie.id}`}>
                  <Play className="mr-2 h-5 w-5" /> Play
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href={featuredMovie ? (featuredMovie.series_id ? `/stream/series/${featuredMovie.series_id}` : `/stream/movies/${featuredMovie.id}`) : "#"}>
                  <Info className="mr-2 h-5 w-5" /> More Info
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Recent Watch History */}
      <RecentWatchHistory />
      <div className="container px-4 space-y-12">
        {/* Latest Movies */}
        <ContentSlider title="Latest Movies" items={latestMovies} type="movie" viewAllLink="/stream/movies" />
        {/* Latest Series */}
        <ContentSlider title="Latest Series" items={latestSeries} type="series" viewAllLink="/stream/series" />
      </div>
    </div>
  )
}
