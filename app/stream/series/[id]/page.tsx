import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Play } from "lucide-react"
import { ContentSlider } from "@/components/stream/content-slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { prisma } from "@/lib/prisma"

interface SeriesDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function SeriesDetailPage({ params }: SeriesDetailPageProps) {
  const awaitedParams = await params

  // Fetch series details
  const series = await prisma.series.findUnique({
    where: { id: awaitedParams.id, status: "published" },
    include: {
      genres: true,
    },
  })
  if (!series) return notFound()

  // Fetch episodes for this series
  const episodes = await prisma.episode.findMany({
    where: { series_id: awaitedParams.id, status: "published" },
    orderBy: [
      { season_number: "asc" },
      { episode_number: "asc" },
    ],
  })

  // Get unique seasons
  const uniqueSeasons = Array.from(
    new Set(episodes?.map((episode) => episode.season_number.toString()) || []),
  ).sort((a, b) => Number.parseInt(a) - Number.parseInt(b))

  // Set default season to first season
  const currentSeason = uniqueSeasons[0] || ""

  // Fetch similar series
  const similarSeries = await prisma.series.findMany({
    where: {
      status: "published",
      genres: {
        some: {
          id: { in: series.genres.map((g) => g.id) },
        },
      },
      id: { not: awaitedParams.id },
    },
    take: 10,
  })

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
            {series.genres && series.genres.length > 0 && (
              <span className="flex gap-1 flex-wrap">
                {series.genres.map((genre) => (
                  <span key={genre.id} className="bg-white/20 px-2 py-1 rounded text-xs">
                    {genre.name}
                  </span>
                ))}
              </span>
            )}
          </div>
          <p className="text-lg max-w-2xl">{series.description}</p>
        </div>
      </div>

      <div className="container px-4 py-8 space-y-12">
        {/* Episodes by season */}
        {uniqueSeasons.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Episodes</h2>

            <Tabs defaultValue={currentSeason} className="w-full">
              <TabsList className="mb-6 bg-gray-900">
                {uniqueSeasons.map((season) => (
                  <TabsTrigger key={season} value={season}>
                    Season {season}
                  </TabsTrigger>
                ))}
              </TabsList>

              {uniqueSeasons.map((season) => (
                <TabsContent key={season} value={season} className="space-y-4">
                  <div className="grid gap-4">
                    {episodes
                      .filter((episode) => episode.season_number.toString() === season)
                      .map((episode) => (
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
