"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { notFound, useParams } from "next/navigation"
import { Play } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ContentSlider } from "@/components/stream/content-slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SeriesDetailPage() {
  const params = useParams()
  const [series, setSeries] = useState<any>(null)
  const [episodes, setEpisodes] = useState<any[]>([])
  const [similarSeries, setSimilarSeries] = useState<any[]>([])
  const [seasons, setSeasons] = useState<string[]>([])
  const [currentSeason, setCurrentSeason] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch series details
        const { data: seriesData, error: seriesError } = await supabase
          .from("series")
          .select("*")
          .eq("id", params.id)
          .eq("status", "published")
          .single()

        if (seriesError) throw seriesError
        if (!seriesData) throw new Error("Series not found")

        setSeries(seriesData)

        // Fetch episodes for this series
        const { data: episodesData, error: episodesError } = await supabase
          .from("episodes")
          .select("*")
          .eq("series_id", params.id)
          .eq("status", "published")
          .order("season_number", { ascending: true })
          .order("episode_number", { ascending: true })

        if (episodesError) throw episodesError
        setEpisodes(episodesData || [])

        // Get unique seasons
        const uniqueSeasons = Array.from(
          new Set(episodesData?.map((episode) => episode.season_number.toString()) || []),
        ).sort((a, b) => Number.parseInt(a) - Number.parseInt(b))

        setSeasons(uniqueSeasons)

        // Set default season to first season
        if (uniqueSeasons.length > 0) {
          setCurrentSeason(uniqueSeasons[0])
        }

        // Fetch similar series
        const { data: similarData } = await supabase
          .from("series")
          .select("*")
          .eq("status", "published")
          .eq("genre", seriesData.genre)
          .neq("id", params.id)
          .limit(10)

        setSimilarSeries(similarData || [])
      } catch (err: any) {
        console.error("Error fetching series data:", err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error || !series) {
    return notFound()
  }

  // Filter episodes by current season
  const currentSeasonEpisodes = episodes.filter((episode) => episode.season_number.toString() === currentSeason)

  return (
    <div>
      {/* Hero section */}
      <div className="relative h-[50vh] md:h-[70vh] w-full">
        <Image
          src={series.poster_url || "/placeholder.svg"}
          alt={series.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold">{series.title}</h1>
          <div className="flex items-center gap-4 text-sm">
            <span>{series.release_year}</span>
            <span className="bg-white/20 px-2 py-1 rounded">{series.genre}</span>
          </div>
          <p className="text-lg max-w-2xl">{series.description}</p>
        </div>
      </div>

      <div className="container px-4 py-8 space-y-12">
        {/* Episodes by season */}
        {seasons.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Episodes</h2>

            <Tabs value={currentSeason} onValueChange={setCurrentSeason} className="w-full">
              <TabsList className="mb-6 bg-gray-900">
                {seasons.map((season) => (
                  <TabsTrigger key={season} value={season}>
                    Season {season}
                  </TabsTrigger>
                ))}
              </TabsList>

              {seasons.map((season) => (
                <TabsContent key={season} value={season} className="space-y-4">
                  <div className="grid gap-4">
                    {currentSeasonEpisodes.map((episode) => (
                      <Link
                        key={episode.id}
                        href={`/stream/watch/episode/${episode.id}`}
                        className="flex flex-col md:flex-row gap-4 bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition"
                      >
                        <div className="relative w-full md:w-64 aspect-video md:aspect-[16/9]">
                          <Image
                            src={episode.poster_url || "/placeholder.svg"}
                            alt={episode.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition bg-black/50">
                            <Play className="h-12 w-12" />
                          </div>
                        </div>
                        <div className="p-4 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">
                              {episode.episode_number}. {episode.title}
                            </h4>
                            <span className="text-sm text-gray-400">{Math.floor(episode.duration / 60)}m</span>
                          </div>
                          <p className="text-sm text-gray-400 mt-2 line-clamp-2">{episode.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No episodes available yet</p>
          </div>
        )}

        {/* Similar Series */}
        {similarSeries && similarSeries.length > 0 && (
          <ContentSlider title="More Like This" items={similarSeries} type="series" />
        )}
      </div>
    </div>
  )
}
