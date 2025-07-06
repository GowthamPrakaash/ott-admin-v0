"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContentSliderProps {
  title: string
  items: any[]
  type: "movie" | "series" | "episode"
  viewAllLink?: string
}

export function ContentSlider({ title, items, type, viewAllLink }: ContentSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return

    const { scrollLeft, clientWidth } = sliderRef.current
    const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75

    sliderRef.current.scrollTo({
      left: scrollTo,
      behavior: "smooth",
    })
  }

  const handleScroll = () => {
    if (!sliderRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current
    setShowLeftArrow(scrollLeft > 0)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-sm text-gray-400 hover:text-white transition">
            View All
          </Link>
        )}
      </div>

      <div className="relative group">
        {showLeftArrow && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}

        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 pt-1 pl-1"
          onScroll={handleScroll}
        >
          {items.map((item) => (
            <Link
              key={item.id}
              href={type === "movie" ? `/stream/movies/${item.id}` : `/stream/series/${item.id}`}
              className="flex-shrink-0 w-[180px] transition transform hover:scale-105"
            >
              <div className="relative aspect-[2/3] rounded-md overflow-hidden">
                <Image src={item.poster_url || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
              </div>
              <h3 className="mt-2 text-sm font-medium truncate">{item.title}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-400 flex-wrap">
                <span>{item.release_year}</span>
                {item.genres && item.genres.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex gap-1 flex-wrap">
                      {item.genres.map((g: any) => (
                        <span key={g.id} className="bg-gray-200 text-gray-700 rounded px-2 py-0.5 text-xs mr-1 mb-1">
                          {g.name}
                        </span>
                      ))}
                    </span>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>

        {showRightArrow && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  )
}
