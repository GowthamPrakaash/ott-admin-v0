import { createClient } from "@/lib/supabase/server"
import { ContentGrid } from "@/components/stream/content-grid"

export const metadata = {
  title: "Movies | Apsara Streaming",
  description: "Browse all movies on Apsara Streaming",
}

export default async function MoviesPage() {
  const supabase = createClient()

  // Fetch all published movies
  const { data: movies } = await supabase
    .from("movies")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })

  // Fetch genres for filtering
  const { data: genres } = await supabase.from("genres").select("name").order("name")

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Movies</h1>

      <ContentGrid items={movies || []} type="movie" genres={genres?.map((g) => g.name) || []} />
    </div>
  )
}
