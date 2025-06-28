"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VideoPlayerProps {
  content: any
  contentType: string
  nextEpisode?: any
}

export function VideoPlayer({ content, contentType, nextEpisode }: VideoPlayerProps) {
  const [showNextEpisode, setShowNextEpisode] = useState(false)
  const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID

  // Set up timer for next episode prompt
  useEffect(() => {
    if (contentType === "episode" && nextEpisode) {
      const timer = setTimeout(() => {
        setShowNextEpisode(true)
      }, 5000) // Show next episode prompt after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [contentType, nextEpisode])

  if (!content || !content.video_id) {
    return (
      <div className="aspect-video bg-gray-900 flex items-center justify-center rounded-lg">
        <p className="text-gray-400">Video not available</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={`https://iframe.mediadelivery.net/embed/${libraryId}/${content.video_id}?autoplay=true`}
          loading="lazy"
          className="w-full h-full border-0"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen={true}
        ></iframe>
      </div>

      {showNextEpisode && nextEpisode && (
        <div className="absolute bottom-4 right-4 bg-black/80 p-4 rounded-lg max-w-xs">
          <p className="text-sm font-medium mb-2">Up Next</p>
          <div className="flex items-center gap-2">
            <div>
              <p className="text-xs">
                S{nextEpisode.season_number} E{nextEpisode.episode_number}
              </p>
              <p className="font-medium truncate">{nextEpisode.title}</p>
            </div>
            <Button asChild size="sm" className="ml-auto">
              <Link href={`/stream/watch/episode/${nextEpisode.id}`}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
