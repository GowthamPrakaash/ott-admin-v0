"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface ContentGridProps {
  items: any[]
  type: "movie" | "series"
  genres?: string[]
}

export function ContentGrid({ items, type, genres = [] }: ContentGridProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>("all")

  const filteredItems = selectedGenre === "all" ? items : items.filter((item) => item.genre === selectedGenre)

  return (
    <div>
      {genres.length > 0 && (
        <div className="flex overflow-x-auto scrollbar-hide gap-2 mb-8 pb-2">
          <Button
            variant={selectedGenre === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedGenre("all")}
            className="rounded-full"
          >
            All
          </Button>
          {genres.map((genre) => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedGenre(genre)}
              className="rounded-full whitespace-nowrap"
            >
              {genre}
            </Button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {filteredItems.map((item) => (
          <Link
            key={item.id}
            href={type === "movie" ? `/stream/movies/${item.id}` : `/stream/series/${item.id}`}
            className="transition transform hover:scale-105"
          >
            <div className="relative aspect-[2/3] rounded-md overflow-hidden">
              <Image src={item.poster_url || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
            </div>
            <h3 className="mt-2 text-sm font-medium truncate">{item.title}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>{item.release_year}</span>
              {item.genre && (
                <>
                  <span>•</span>
                  <span className="truncate">{item.genre}</span>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No content found</p>
        </div>
      )}
    </div>
  )
}
