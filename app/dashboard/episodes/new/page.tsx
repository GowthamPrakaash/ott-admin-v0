import type { Metadata } from "next"
import { EpisodeForm } from "@/components/episodes/episode-form"

export const metadata: Metadata = {
  title: "Add Episode",
  description: "Add a new episode to a series",
}

export default function NewEpisodePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Episode</h1>
        <p className="text-muted-foreground">Add a new episode to a series</p>
      </div>

      <div className="mx-auto max-w-3xl">
        <EpisodeForm />
      </div>
    </div>
  )
}
