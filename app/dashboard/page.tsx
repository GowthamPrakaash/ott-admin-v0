import type { Metadata } from "next"
import Link from "next/link"
import { Film, Plus, Tv, Video } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "OTT Admin Dashboard",
}

export default async function DashboardPage() {
  const [moviesCount, seriesCount, episodesCount] = await Promise.all([
    prisma.movie.count(),
    prisma.series.count(),
    prisma.episode.count(),
  ])
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage your OTT platform content</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild>
            <Link href="/dashboard/movies/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Movie
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/series/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Series
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/episodes/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Episode
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movies</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moviesCount || 0}</div>
            <p className="text-xs text-muted-foreground">Movies in your library</p>
            <Button variant="link" className="px-0 mt-2" asChild>
              <Link href="/dashboard/movies">View all movies</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Series</CardTitle>
            <Tv className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{seriesCount || 0}</div>
            <p className="text-xs text-muted-foreground">Series in your library</p>
            <Button variant="link" className="px-0 mt-2" asChild>
              <Link href="/dashboard/series">View all series</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Episodes</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{episodesCount || 0}</div>
            <p className="text-xs text-muted-foreground">Episodes across all series</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Recent Movies</CardTitle>
            <CardDescription>Recently added movies to your platform</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Recent movies list would go here */}
            <div className="text-center py-6 text-muted-foreground">
              <p>Start adding movies to see them here</p>
              <Button variant="outline" className="mt-2" asChild>
                <Link href="/dashboard/movies/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Movie
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Recent Series</CardTitle>
            <CardDescription>Recently added series to your platform</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Recent series list would go here */}
            <div className="text-center py-6 text-muted-foreground">
              <p>Start adding series to see them here</p>
              <Button variant="outline" className="mt-2" asChild>
                <Link href="/dashboard/series/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Series
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
