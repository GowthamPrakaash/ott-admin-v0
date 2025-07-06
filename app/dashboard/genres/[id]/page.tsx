import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { Edit } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteButton } from "@/components/shared/delete-button"

interface GenrePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const awaitedParams = await params;
  const genre = await prisma.genre.findUnique({ where: { id: awaitedParams.id } })

  if (!genre) {
    return {
      title: "Genre Not Found",
    }
  }

  return {
    title: `${genre.name} | Genre`,
    description: `View and manage genre: ${genre.name}`,
  }
}

export default async function GenrePage({ params }: GenrePageProps) {
  const awaitedParams = await params;

  // Fetch genre using Prisma
  const genre = await prisma.genre.findUnique({ where: { id: awaitedParams.id } })
  if (!genre) return notFound()

  // Count movies and series with this genre
  const [moviesCount, seriesCount] = await Promise.all([
    prisma.movie.count({ where: { genres: { some: { name: genre.name } } } }),
    prisma.series.count({ where: { genres: { some: { name: genre.name } } } }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{genre.name}</h1>
          <p className="text-muted-foreground">View and manage genre details</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/genres/${awaitedParams.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Genre
            </Link>
          </Button>
          <DeleteButton id={awaitedParams.id} name={genre.name} type="genre" redirectTo="/dashboard/genres" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{genre.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{genre.description || "No description available."}</p>
            <div className="text-xs text-muted-foreground mt-4">
              Added {format(new Date(genre.createdAt), "MMM d, yyyy")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">Movies</p>
                <p className="text-2xl font-bold">{moviesCount || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Series</p>
                <p className="text-2xl font-bold">{seriesCount || 0}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/movies?genre=${encodeURIComponent(genre.name)}`}>View Movies</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/series?genre=${encodeURIComponent(genre.name)}`}>View Series</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
