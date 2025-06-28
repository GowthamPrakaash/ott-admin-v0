import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MovieForm } from "@/components/movies/movie-form"

interface EditMoviePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: EditMoviePageProps): Promise<Metadata> {
  const supabase = createClient()

  const { data: movie } = await supabase.from("movies").select("title").eq("id", params.id).single()

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
  const supabase = createClient()

  const { data: movie, error } = await supabase.from("movies").select("*").eq("id", params.id).single()

  if (error || !movie) {
    notFound()
  }

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
