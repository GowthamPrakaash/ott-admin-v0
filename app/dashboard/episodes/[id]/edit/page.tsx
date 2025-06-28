import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EpisodeForm } from "@/components/episodes/episode-form"

interface EditEpisodePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: EditEpisodePageProps): Promise<Metadata> {
  const supabase = createClient()

  const { data: episode } = await supabase.from("episodes").select("title").eq("id", params.id).single()

  if (!episode) {
    return {
      title: "Episode Not Found",
    }
  }

  return {
    title: `Edit ${episode.title}`,
    description: `Edit episode details for ${episode.title}`,
  }
}

export default async function EditEpisodePage({ params }: EditEpisodePageProps) {
  const supabase = createClient()

  const { data: episode, error } = await supabase.from("episodes").select("*").eq("id", params.id).single()

  if (error || !episode) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Episode</h1>
        <p className="text-muted-foreground">Update episode details for {episode.title}</p>
      </div>

      <div className="mx-auto max-w-3xl">
        <EpisodeForm episode={episode} />
      </div>
    </div>
  )
}
