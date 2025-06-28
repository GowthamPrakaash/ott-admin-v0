import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VideoPlayer } from "@/components/stream/video-player"
import { ContentSlider } from "@/components/stream/content-slider"

export async function generateMetadata({ params }: { params: { type: string; id: string } }) {
  const supabase = createClient()

  if (params.type === "movie") {
    const { data: movie } = await supabase.from("movies").select("title, meta_title").eq("id", params.id).single()

    if (!movie) {
      return {
        title: "Content Not Found",
      }
    }

    return {
      title: `${movie.meta_title || movie.title} | Apsara Streaming`,
    }
  } else if (params.type === "episode") {
    const { data: episode } = await supabase
      .from("episodes")
      .select("title, meta_title, series:series_id(title)")
      .eq("id", params.id)
      .single()

    if (!episode) {
      return {
        title: "Content Not Found",
      }
    }

    return {
      title: `${episode.meta_title || episode.title} - ${episode.series.title} | Apsara Streaming`,
    }
  }

  return {
    title: "Watch | Apsara Streaming",
  }
}

export default async function WatchPage({ params }: { params: { type: string; id: string } }) {
  const supabase = createClient()

  let content: any = null
  let relatedContent: any[] = []
  let nextEpisode: any = null

  if (params.type === "movie") {
    // Fetch movie details
    const { data: movie, error } = await supabase
      .from("movies")
      .select("*")
      .eq("id", params.id)
      .eq("status", "published")
      .single()

    if (error || !movie) {
      notFound()
    }

    content = movie

    // Fetch related movies (same genre)
    const { data: related } = await supabase
      .from("movies")
      .select("*")
      .eq("status", "published")
      .eq("genre", movie.genre)
      .neq("id", params.id)
      .limit(10)

    relatedContent = related || []
  } else if (params.type === "episode") {
    // Fetch episode details
    const { data: episode, error } = await supabase
      .from("episodes")
      .select("*, series:series_id(*)")
      .eq("id", params.id)
      .eq("status", "published")
      .single()

    if (error || !episode) {
      notFound()
    }

    content = episode

    // Fetch next episode
    const { data: next } = await supabase
      .from("episodes")
      .select("*")
      .eq("series_id", episode.series_id)
      .eq("status", "published")
      .eq("season_number", episode.season_number)
      .gt("episode_number", episode.episode_number)
      .order("episode_number", { ascending: true })
      .limit(1)
      .single()

    if (!next) {
      // Try next season
      const { data: nextSeason } = await supabase
        .from("episodes")
        .select("*")
        .eq("series_id", episode.series_id)
        .eq("status", "published")
        .gt("season_number", episode.season_number)
        .order("season_number", { ascending: true })
        .order("episode_number", { ascending: true })
        .limit(1)
        .single()

      nextEpisode = nextSeason || null
    } else {
      nextEpisode = next
    }

    // Fetch more episodes from the same series
    const { data: moreEpisodes } = await supabase
      .from("episodes")
      .select("*")
      .eq("series_id", episode.series_id)
      .eq("status", "published")
      .neq("id", params.id)
      .order("season_number", { ascending: true })
      .order("episode_number", { ascending: true })
      .limit(10)

    relatedContent = moreEpisodes || []
  } else {
    notFound()
  }

  return (
    <div className="container px-4 py-8 space-y-8">
      <VideoPlayer content={content} contentType={params.type} nextEpisode={nextEpisode} />

      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{content.title}</h1>

        {params.type === "episode" && content.series && (
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium">{content.series.title}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">
              Season {content.season_number}, Episode {content.episode_number}
            </span>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm">
          <span>{content.release_year}</span>
          <span className="bg-white/20 px-2 py-1 rounded">{content.genre}</span>
          <span>{Math.floor(content.duration / 60)}m</span>
        </div>

        <p className="text-gray-300 max-w-3xl">{content.description}</p>
      </div>

      {relatedContent.length > 0 && (
        <div className="pt-8">
          <ContentSlider
            title={params.type === "movie" ? "More Like This" : "More Episodes"}
            items={relatedContent}
            type={params.type === "movie" ? "movie" : "episode"}
          />
        </div>
      )}
    </div>
  )
}
