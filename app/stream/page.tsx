import Link from "next/link"
import Image from "next/image"
import { Play, Info } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ContentSlider } from "@/components/stream/content-slider"

export default async function StreamPage() {
  const supabase = createClient()

  // Fetch featured content (latest movie)
  const { data: featuredMovie } = await supabase
    .from("movies")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  // Fetch latest movies
  const { data: latestMovies } = await supabase
    .from("movies")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(10)

  // Fetch latest series
  const { data: latestSeries } = await supabase
    .from("series")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(10)

  // We've removed the genre-specific content fetching

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
              <Button variant="outline" size="lg">
                <Info className="mr-2 h-5 w-5" /> More Info
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container px-4 space-y-12">
        {/* Latest Movies */}
        <ContentSlider title="Latest Movies" items={latestMovies || []} type="movie" viewAllLink="/stream/movies" />

        {/* Latest Series */}
        <ContentSlider title="Latest Series" items={latestSeries || []} type="series" viewAllLink="/stream/series" />

        {/* We've removed the genre-specific content sections as requested */}
      </div>
    </div>
  )
}
