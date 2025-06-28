import { createClient } from "@/lib/supabase/server"

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: series } = await supabase.from("series").select("title, meta_title").eq("id", params.id).single()

  if (!series) {
    return {
      title: "Series Not Found",
    }
  }

  return {
    title: `${series.meta_title || series.title} | Apsara Streaming`,
  }
}
