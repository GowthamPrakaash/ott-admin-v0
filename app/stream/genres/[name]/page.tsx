import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ContentGrid } from "@/components/stream/content-grid"

export async function generateMetadata({ params }: { params: { name: string } }) {
  const decodedName = decodeURIComponent(params.name)

  return {
    title: `${decodedName} | Apsara Streaming`,
    description: `Browse ${decodedName} content on Apsara Streaming`,
  }
}

export default async function GenrePage({ params }: { params: { name: string } }) {
  const decodedName = decodeURIComponent(params.name)
  const supabase = createClient()

  // Fetch genre details
  const { data: genre, error } = await supabase.from("genres").select("*").eq("name", decodedName).single()

  if (error) {
    notFound()
  }

  // Fetch movies in this genre
  const { data: movies } = await supabase
    .from("movies")
    .select("*")
    .eq("status", "published")
    .eq("genre", decodedName)
    .order("created_at", { ascending: false })

  // Fetch series in this genre
  const { data: series } = await supabase
    .from("series")
    .select("*")
    .eq("status", "published")
    .eq("genre", decodedName)
    .order("created_at", { ascending: false })

  // Combine movies and series
  const allContent = [
    ...(movies || []).map((item) => ({ ...item, contentType: "movie" })),
    ...(series || []).map((item) => ({ ...item, contentType: "series" })),
  ]

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{decodedName}</h1>
      {genre?.description && <p className="text-gray-400 mb-8 max-w-3xl">{genre.description}</p>}

      <div className="space-y-12">
        {movies && movies.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-6">Movies</h2>
            <ContentGrid items={movies} type="movie" />
          </div>
        )}

        {series && series.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-6">Series</h2>
            <ContentGrid items={series} type="series" />
          </div>
        )}

        {allContent.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No content found in this genre</p>
          </div>
        )}
      </div>
    </div>
  )
}
