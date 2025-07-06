import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EpisodeForm } from "@/components/episodes/episode-form"

interface EditEpisodePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: EditEpisodePageProps): Promise<Metadata> {
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
    title: `Edit ${episode.title}`,
    description: `Edit episode details for ${episode.title}`,
  }
}

export default async function EditEpisodePage({ params }: EditEpisodePageProps) {
  const episode = await prisma.episode.findUnique({ where: { id: params.id } })
  if (!episode) notFound()

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
