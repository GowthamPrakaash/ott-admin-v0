import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { CalendarDays, Clock, Edit, Plus, Video } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DeleteButton } from "@/components/shared/delete-button"
import { StatusBadge } from "@/components/shared/status-badge"

interface SeriesPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: SeriesPageProps): Promise<Metadata> {
  const awaitedParams = await params
  const series = await prisma.series.findUnique({
    where: { id: awaitedParams.id },
    select: { title: true },
  })

  if (!series) {
    return {
      title: "Series Not Found",
    }
  }

  return {
    title: `${series.title} | Series`,
    description: `Manage episodes for ${series.title}`,
  }
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const awaitedParams = await params

  // Fetch series using Prisma
  const series = await prisma.series.findUnique({
    where: { id: awaitedParams.id },
    include: {
      genres: true,
      episodes: {
        orderBy: [
          { season_number: "asc" },
          { episode_number: "asc" },
        ],
      },
    },
  })

  if (!series) {
    return notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{series.title}</h1>
            <StatusBadge status={series.status} />
          </div>
          <p className="text-muted-foreground">Manage episodes for this series</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/series/${awaitedParams.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Series
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/episodes/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Episode
            </Link>
          </Button>
          <DeleteButton id={awaitedParams.id} name={series.title} type="series" redirectTo="/dashboard/series" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <div className="aspect-[2/3] relative">
              <Image
                src={series.poster_url || "/placeholder.svg?height=200&width=300"}
                alt={series.title}
                fill
                className="object-cover rounded-t-lg"
              />
            </div>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mt-1 text-sm">
                <span>{series.release_year}</span>
                <span>•</span>
                {series.genres && series.genres.length > 0 && (
                  <span className="flex gap-1 flex-wrap">
                    {series.genres.map((g: any) => (
                      <span key={g.id} className="bg-gray-200 text-gray-700 rounded px-2 py-0.5 text-xs mr-1 mb-1">
                        {g.name}
                      </span>
                    ))}
                  </span>
                )}
              </div>
              <p className="mt-4 text-sm">{series.description}</p>
              <div className="text-xs text-muted-foreground mt-4">
                Added {format(new Date(series.createdAt), "MMM d, yyyy")}
              </div>
            </CardContent>
          </Card>

          {series.meta_title || series.meta_description ? (
            <Card className="mt-4">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">SEO Meta Tags</h3>
                {series.meta_title && (
                  <div className="mb-2">
                    <p className="text-sm font-medium">Meta Title</p>
                    <p className="text-sm text-muted-foreground">{series.meta_title}</p>
                  </div>
                )}
                {series.meta_description && (
                  <div>
                    <p className="text-sm font-medium">Meta Description</p>
                    <p className="text-sm text-muted-foreground">{series.meta_description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Episodes</h2>

          {series.episodes.length === 0 && (
            <div className="text-center py-12 border rounded-lg">
              <Video className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No episodes found</h3>
              <p className="mt-2 text-muted-foreground">Get started by adding your first episode.</p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/episodes/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Episode
                </Link>
              </Button>
            </div>
          )}

          {series.episodes.length > 0 && (
            <div className="space-y-4">
              {/* Group episodes by season */}
              {Array.from(new Set(series.episodes.map((ep) => ep.season_number)))
                .sort()
                .map((season) => (
                  <div key={season} className="space-y-3">
                    <h3 className="font-medium">Season {season}</h3>
                    <div className="grid gap-3">
                      {series.episodes
                        .filter((ep) => ep.season_number === season)
                        .sort((a, b) => a.episode_number - b.episode_number)
                        .map((episode) => (
                          <Link key={episode.id} href={`/dashboard/episodes/${episode.id}`} className="block">
                            <Card className="overflow-hidden transition-all hover:shadow-md">
                              <div className="flex flex-col sm:flex-row">
                                <div className="sm:w-36 aspect-[2/3] relative">
                                  <Image
                                    src={episode.poster_url || "/placeholder.svg?height=100&width=150"}
                                    alt={episode.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <CardContent className="p-4 flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold">
                                      {episode.episode_number}. {episode.title}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <StatusBadge status={episode.status} />
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                      <Clock className="mr-1 h-3 w-3" />
                                      <span>
                                        {Math.floor(episode.duration / 60)}h {episode.duration % 60}m
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <CalendarDays className="mr-1 h-3 w-3" />
                                      <span>{format(new Date(episode.release_date), "MMM d, yyyy")}</span>
                                    </div>
                                  </div>
                                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                    {episode.description}
                                  </p>
                                </CardContent>
                              </div>
                            </Card>
                          </Link>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
