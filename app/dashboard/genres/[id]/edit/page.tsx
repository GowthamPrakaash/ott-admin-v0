import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GenreForm } from "@/components/genres/genre-form"

interface EditGenrePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: EditGenrePageProps): Promise<Metadata> {
  const supabase = createClient()

  const { data: genre } = await supabase.from("genres").select("name").eq("id", params.id).single()

  if (!genre) {
    return {
      title: "Genre Not Found",
    }
  }

  return {
    title: `Edit ${genre.name}`,
    description: `Edit genre details for ${genre.name}`,
  }
}

export default async function EditGenrePage({ params }: EditGenrePageProps) {
  const supabase = createClient()

  const { data: genre, error } = await supabase.from("genres").select("*").eq("id", params.id).single()

  if (error || !genre) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Genre</h1>
        <p className="text-muted-foreground">Update genre details for {genre.name}</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <GenreForm genre={genre} />
      </div>
    </div>
  )
}
