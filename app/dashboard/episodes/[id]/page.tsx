import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { CalendarDays, Clock, Edit, Languages } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DeleteButton } from "@/components/shared/delete-button"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"

interface EpisodePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: EpisodePageProps): Promise<Metadata> {
  const episode = await prisma.episode.findUnique({
    where: { id: params.id },
    select: { title: true },
  })

  if (!episode) {
    return {
      title: "Episode Not Found",
    }
  }

  return {
    title: `${episode.title} | Episode`,
    description: `View and manage episode: ${episode.title}`,
  }
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  // Fetch episode using Prisma
  const episode = await prisma.episode.findUnique({
    where: { id: params.id },
    include: { series: { select: { title: true } } },
  })
  if (!episode) return notFound()

  // Parse subtitles from JSON
  const subtitles = episode.subtitles ? (Array.isArray(episode.subtitles) ? episode.subtitles : []) : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{episode.title}</h1>
            <StatusBadge status={episode.status} />
          </div>
          <p className="text-muted-foreground">
            Season {episode.season_number}, Episode {episode.episode_number} of{" "}
            <Link href={`/dashboard/series/${episode.series_id}`} className="underline hover:text-primary">
              {episode.series.title}
            </Link>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/episodes/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Episode
            </Link>
          </Button>
          <DeleteButton
            id={params.id}
            name={episode.title}
            type="episode"
            redirectTo={`/dashboard/series/${episode.series_id}`}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="aspect-[2/3] relative max-w-[240px]">
            <Image
              src={episode.poster_url || "/placeholder.svg?height=200&width=300"}
              alt={episode.title}
              fill
              className="object-cover rounded-t-lg"
            />
          </div>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mt-1 text-sm">
              <span>Season {episode.season_number}</span>
              <span>•</span>
              <span>Episode {episode.episode_number}</span>
              <span>•</span>
              <div className="flex items-center text-sm">
                <Clock className="mr-1 h-3 w-3" />
                <span>
                  {Math.floor(episode.duration / 60)}h {episode.duration % 60}m
                </span>
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <CalendarDays className="mr-1 h-3 w-3" />
              <span>Released {format(new Date(episode.release_date), "MMMM d, yyyy")}</span>
            </div>
            <p className="mt-4 text-sm">{episode.description}</p>
            <div className="text-xs text-muted-foreground mt-4">
              Added {format(new Date(episode.created_at), "MMM d, yyyy")}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Video Information</h3>
              <p className="text-sm text-muted-foreground">Video ID: {episode.video_id}</p>

              {subtitles.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Languages className="h-4 w-4" />
                    <h4 className="font-medium">Subtitles</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subtitles.map((subtitle: any) => (
                      <Badge key={subtitle.language} variant="outline">
                        {subtitle.label || subtitle.language}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {episode.meta_title || episode.meta_description ? (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">SEO Meta Tags</h3>
                {episode.meta_title && (
                  <div className="mb-2">
                    <p className="text-sm font-medium">Meta Title</p>
                    <p className="text-sm text-muted-foreground">{episode.meta_title}</p>
                  </div>
                )}
                {episode.meta_description && (
                  <div>
                    <p className="text-sm font-medium">Meta Description</p>
                    <p className="text-sm text-muted-foreground">{episode.meta_description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
