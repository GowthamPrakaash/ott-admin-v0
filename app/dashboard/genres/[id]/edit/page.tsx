import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { GenreForm } from "@/components/genres/genre-form"

interface EditGenrePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditGenrePageProps): Promise<Metadata> {
  const awaitedParams = await params
  const genre = await prisma.genre.findUnique({ where: { id: awaitedParams.id } })

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
  const awaitedParams = await params
  // Fetch genre using Prisma
  const genre = await prisma.genre.findUnique({ where: { id: awaitedParams.id } })
  if (!genre) return null

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
