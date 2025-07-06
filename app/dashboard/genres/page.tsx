import type { Metadata } from "next"
import Link from "next/link"
import { format } from "date-fns"
import { Layers, Plus } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Genres",
  description: "Manage your content genres",
}

export default async function GenresPage() {
  // Fetch genres using Prisma
  const genres = await prisma.genre.findMany({ orderBy: { name: "asc" } })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Genres</h1>
          <p className="text-muted-foreground">Manage your content genres</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/genres/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Genre
          </Link>
        </Button>
      </div>

      {genres && genres.length === 0 && (
        <div className="text-center py-12">
          <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No genres found</h2>
          <p className="mt-2 text-muted-foreground">Get started by adding your first genre.</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/genres/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Genre
            </Link>
          </Button>
        </div>
      )}

      {genres && genres.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {genres.map((genre) => (
            <Link key={genre.id} href={`/dashboard/genres/${genre.id}`}>
              <Card className="h-full transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle>{genre.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {genre.description || "No description available."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Added {format(new Date(genre.createdAt), "MMM d, yyyy")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
