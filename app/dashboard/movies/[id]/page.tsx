import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { Clock, Edit, Languages } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DeleteButton } from "@/components/shared/delete-button"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"

interface MoviePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const supabase = createClient()

  const { data: movie } = await supabase.from("movies").select("title").eq("id", params.id).single()

  if (!movie) {
    return {
      title: "Movie Not Found",
    }
  }

  return {
    title: `${movie.title} | Movie`,
    description: `View and manage movie: ${movie.title}`,
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const supabase = createClient()

  const { data: movie, error: movieError } = await supabase.from("movies").select("*").eq("id", params.id).single()

  if (movieError || !movie) {
    notFound()
  }

  // Parse subtitles from JSON
  const subtitles = movie.subtitles ? (Array.isArray(movie.subtitles) ? movie.subtitles : []) : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{movie.title}</h1>
            <StatusBadge status={movie.status} />
          </div>
          <p className="text-muted-foreground">
            {movie.release_year} • {movie.genre}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/movies/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Movie
            </Link>
          </Button>
          <DeleteButton id={params.id} name={movie.title} type="movie" redirectTo="/dashboard/movies" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="aspect-[2/3] relative max-w-[240px]">
            <Image
              src={movie.poster_url || "/placeholder.svg?height=200&width=300"}
              alt={movie.title}
              fill
              className="object-cover rounded-t-lg"
            />
          </div>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mt-1 text-sm">
              <span>{movie.release_year}</span>
              <span>•</span>
              <span>{movie.genre}</span>
              <span>•</span>
              <div className="flex items-center text-sm">
                <Clock className="mr-1 h-3 w-3" />
                <span>
                  {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm">{movie.description}</p>
            <div className="text-xs text-muted-foreground mt-4">
              Added {format(new Date(movie.created_at), "MMM d, yyyy")}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Video Information</h3>
              <p className="text-sm text-muted-foreground">Video ID: {movie.video_id}</p>

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

          {movie.meta_title || movie.meta_description ? (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">SEO Meta Tags</h3>
                {movie.meta_title && (
                  <div className="mb-2">
                    <p className="text-sm font-medium">Meta Title</p>
                    <p className="text-sm text-muted-foreground">{movie.meta_title}</p>
                  </div>
                )}
                {movie.meta_description && (
                  <div>
                    <p className="text-sm font-medium">Meta Description</p>
                    <p className="text-sm text-muted-foreground">{movie.meta_description}</p>
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
