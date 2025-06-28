import { createClient } from "@/lib/supabase/server"
import { ContentGrid } from "@/components/stream/content-grid"

export const metadata = {
  title: "Series | Apsara Streaming",
  description: "Browse all series on Apsara Streaming",
}

export default async function SeriesPage() {
  const supabase = createClient()

  // Fetch all published series
  const { data: series } = await supabase
    .from("series")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })

  // Fetch genres for filtering
  const { data: genres } = await supabase.from("genres").select("name").order("name")

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Series</h1>

      <ContentGrid items={series || []} type="series" genres={genres?.map((g) => g.name) || []} />
    </div>
  )
}
