import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { VideoPlayer } from "@/components/stream/video-player"
import { ContentSlider } from "@/components/stream/content-slider"

export async function generateMetadata({ params }: { params: Promise<{ type: string; id: string }> }) {
  const awaitedParams = await params;
  if (awaitedParams.type === "movie") {
    const movie = await prisma.movie.findUnique({
      where: { id: awaitedParams.id },
      select: { title: true, meta_title: true },
    })
    if (!movie) {
      return { title: "Content Not Found" }
    }
    return { title: `${movie.meta_title || movie.title} | Apsara Streaming` }
  } else if (awaitedParams.type === "episode") {
    const episode = await prisma.episode.findUnique({
      where: { id: awaitedParams.id },
      select: { title: true, meta_title: true, series_id: true },
    })
    if (!episode) {
      return { title: "Content Not Found" }
    }
    const series = await prisma.series.findUnique({
      where: { id: episode.series_id },
      select: { title: true },
    })
    return { title: `${episode.meta_title || episode.title} - ${series?.title || "Series"} | Apsara Streaming` }
  }
  return { title: "Watch | Apsara Streaming" }
}

function recordWatchHistory(type: string, id: string) {
  let body: any = {}
  if (type === "movie") body.movieId = id
  else if (type === "episode") body.episodeId = id
  else if (type === "series") body.seriesId = id
  fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .catch((error) => {
      console.error("Error recording watch history:", error);
    })
}

export default async function WatchPage({ params }: { params: Promise<{ type: string; id: string }> }) {
  const awaitedParams = await params;
  let content: any = null
  let relatedContent: any[] = []
  let nextEpisode: any = null

  if (awaitedParams.type === "movie") {
    const movie = await prisma.movie.findFirst({
      where: { id: awaitedParams.id, status: "published" },
      include: { genres: true },
    })
    if (!movie) notFound()
    content = movie
    relatedContent = await prisma.movie.findMany({
      where: {
        status: "published",
        genres: {
          some: {
            id: { in: movie.genres.map((g) => g.id) },
          },
        },
        id: { not: awaitedParams.id },
      },
      take: 10,
    })
  } else if (awaitedParams.type === "episode") {
    const episode = await prisma.episode.findFirst({
      where: { id: awaitedParams.id, status: "published" },
      include: { series: true },
    })
    if (!episode) notFound()
    content = episode
    // Find next episode in same season
    nextEpisode = await prisma.episode.findFirst({
      where: {
        series_id: episode.series_id,
        status: "published",
        season_number: episode.season_number,
        episode_number: { gt: episode.episode_number },
      },
      orderBy: { episode_number: "asc" },
    })
    // If not found, try next season
    if (!nextEpisode) {
      nextEpisode = await prisma.episode.findFirst({
        where: {
          series_id: episode.series_id,
          status: "published",
          season_number: { gt: episode.season_number },
        },
        orderBy: [
          { season_number: "asc" },
          { episode_number: "asc" },
        ],
      })
    }
    relatedContent = await prisma.episode.findMany({
      where: {
        series_id: episode.series_id,
        status: "published",
        id: { not: awaitedParams.id },
      },
      orderBy: [
        { season_number: "asc" },
        { episode_number: "asc" },
      ],
      take: 10,
    })
  } else {
    notFound()
  }

  recordWatchHistory(awaitedParams.type, awaitedParams.id)

  return (
    <div className="px-4 py-8 space-y-8">
      <VideoPlayer content={content} contentType={awaitedParams.type} nextEpisode={nextEpisode} />
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{content.title}</h1>
        {awaitedParams.type === "episode" && content.series && (
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
            title={awaitedParams.type === "movie" ? "More Like This" : "More Episodes"}
            items={relatedContent}
            type={awaitedParams.type === "movie" ? "movie" : "episode"}
          />
        </div>
      )}
    </div>
  )
}
