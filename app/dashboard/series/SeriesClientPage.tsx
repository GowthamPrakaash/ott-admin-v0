"use client"

import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { Plus, Tv } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"

export default function SeriesClientPage({
  searchParams,
}: {
  searchParams?: { status?: string }
}) {
  const [series, setSeries] = useState<any[] | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const status = searchParams?.status

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      let query = supabase.from("series").select("*")

      if (status && (status === "published" || status === "draft")) {
        query = query.eq("status", status)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        setError(error)
        setSeries(null)
      } else {
        setSeries(data)
        setError(null)
      }
    }

    fetchData()
  }, [status])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Series</h1>
          <p className="text-muted-foreground">Manage your series library</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/series/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Series
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-48">
          <Select
            defaultValue={status || "all"}
            onValueChange={(value) => {
              const url = new URL(window.location.href)
              if (value === "all") {
                url.searchParams.delete("status")
              } else {
                url.searchParams.set("status", value)
              }
              window.location.href = url.toString()
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          <p>Error loading series: {error.message}</p>
        </div>
      )}

      {series && series.length === 0 && (
        <div className="text-center py-12">
          <Tv className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No series found</h2>
          <p className="mt-2 text-muted-foreground">Get started by adding your first series.</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/series/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Series
            </Link>
          </Button>
        </div>
      )}

      {series && series.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {series.map((item) => (
            <Link key={item.id} href={`/dashboard/series/${item.id}`}>
              <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                <div className="aspect-[2/3] relative">
                  <Image
                    src={item.poster_url || "/placeholder.svg?height=200&width=300"}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>{item.release_year}</span>
                    <span>•</span>
                    <span>{item.genre}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  <div className="text-xs text-muted-foreground mt-3">
                    Added {format(new Date(item.created_at), "MMM d, yyyy")}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
