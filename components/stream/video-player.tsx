"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import videojs from "video.js"
import "video.js/dist/video-js.css"
import { useSession } from "next-auth/react"

interface VideoPlayerProps {
  content: any
  contentType: string
  nextEpisode?: any
  userCanWatch?: boolean
}

export function VideoPlayer({ content, contentType, nextEpisode, userCanWatch = true }: VideoPlayerProps) {
  const { data: session, status } = useSession();
  const [showNextEpisode, setShowNextEpisode] = useState(false)
  const videoNode = useRef<HTMLVideoElement | null>(null)
  const player = useRef<any>(null)

  // Set up timer for next episode prompt
  useEffect(() => {
    if (contentType === "episode" && nextEpisode) {
      const timer = setTimeout(() => {
        setShowNextEpisode(true)
      }, 5000) // Show next episode prompt after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [contentType, nextEpisode])

  // Initialize video.js player
  useEffect(() => {
    // Wait for next tick to ensure DOM is ready
    const initializePlayer = () => {
      if (!videoNode.current) return;

      // Check if element is actually in the DOM
      if (!document.contains(videoNode.current)) return;

      // Dispose previous player if exists
      if (player.current) {
        player.current.dispose();
        player.current = null;
      }

      if (content && content.video_id && userCanWatch) {
        try {
          player.current = videojs(videoNode.current, {
            controls: true,
            preload: 'auto',
            responsive: true,
            fluid: true,
            // Enable subtitle support
            html5: {
              srt: {
                allowNativeTextTracks: false
              }
            },
            // Enable text track display
            textTrackDisplay: {
              allowMultipleShowingTracks: false
            },
            // Force enable text track settings
            textTrackSettings: true,
            sources: [
              {
                src: `${process.env.NEXT_PUBLIC_BASE_URL}/${content.video_id}`,
                type: 'video/mp4',
              },
            ],
          });

          // Wait for player to be ready before adding subtitles
          player.current.ready(() => {
            // Add subtitles if available
            if (content.subtitles && Array.isArray(content.subtitles) && content.subtitles.length > 0) {
              content.subtitles.forEach((sub: any, index: number) => {

                const trackOptions = {
                  kind: 'subtitles',
                  src: sub.src || sub.url, // Handle both src and url properties
                  srclang: sub.language || 'en',
                  label: sub.label || sub.language || 'English',
                  default: index === 0, // Make first subtitle track default
                  mode: index === 0 ? 'showing' : 'disabled', // Enable first track by default
                };

                try {
                  const track = player.current.addRemoteTextTrack(trackOptions, false);

                  // Ensure the track is enabled and showing
                  if (index === 0) {
                    track.track.mode = 'showing';
                  }
                } catch (err) {
                  console.error(`Error adding subtitle track:`, err, trackOptions);
                }
              });

              // Force enable subtitles menu
              const subtitlesButton = player.current.getChild('controlBar').getChild('subtitlesButton');
              if (subtitlesButton) {
                subtitlesButton.show();
              }

              // Ensure text track display is visible and properly configured
              const textTrackDisplay = player.current.getChild('textTrackDisplay');
              if (textTrackDisplay) {
                textTrackDisplay.show();
              }

              // Force update text tracks after a short delay
              setTimeout(() => {
                player.current.trigger('texttrackchange');
              }, 500);

            }
          });
        } catch (error) {
          console.error('Error initializing video player:', error);
        }
      }
    };

    // Use setTimeout to ensure DOM is fully ready
    const timeoutId = setTimeout(initializePlayer, 0);

    // Clean up player on unmount
    return () => {
      clearTimeout(timeoutId);
      if (player.current) {
        player.current.dispose();
        player.current = null;
      }
    };
  }, [content, session?.user?.email, userCanWatch])

  // Record watch event in history
  useEffect(() => {
    if (!session?.user?.email || !userCanWatch) return;
    if (!content || !content.video_id) return;
    // Determine the type and id to send
    let payload: any = {};
    if (contentType === "movie") payload.movieId = content.id;
    else if (contentType === "series") payload.seriesId = content.id;
    else if (contentType === "episode") payload.episodeId = content.id;
    if (!payload.movieId && !payload.seriesId && !payload.episodeId) return;

    fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .catch((error) => {
        console.error("Error recording watch history:", error);
      });
  }, [content, contentType, session?.user?.email, userCanWatch]);

  if (!session) {
    return (
      <div className="aspect-video bg-gray-900 flex items-center justify-center rounded-lg">
        <p className="text-gray-400 text-center">Please <a href="/login" className="underline">log in</a> to watch this video.</p>
      </div>
    );
  }

  if (!userCanWatch) {
    return (
      <div className="aspect-video bg-gray-900 flex items-center justify-center rounded-lg">
        <div className="text-center space-y-4">
          <p className="text-gray-400">Subscription required to watch this content</p>
          <Button asChild>
            <Link href="/stream/subscription">Subscribe Now</Link>
          </Button>
        </div>
      </div>
    );
  }

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
        <video
          ref={videoNode}
          className="video-js vjs-big-play-centered w-full h-full border-0"
        />
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
