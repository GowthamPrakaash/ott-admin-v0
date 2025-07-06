import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRef, useState } from "react"

export function WatchHistoryList({ history }: { history: any[] }) {
    const sliderRef = useRef<HTMLDivElement>(null)
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(true)

    const scroll = (direction: "left" | "right") => {
        if (!sliderRef.current) return
        const { scrollLeft, clientWidth } = sliderRef.current
        const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75
        sliderRef.current.scrollTo({ left: scrollTo, behavior: "smooth" })
    }
    const handleScroll = () => {
        if (!sliderRef.current) return
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current
        setShowLeftArrow(scrollLeft > 0)
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
    if (!history || history.length === 0) {
        return <div className="text-gray-400">No recent watch history.</div>
    }
    return (
        <div className="relative">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Continue Watching</h2>
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
                    {history.map((item) => {
                        const content = item.movie || item.series || item.episode
                        const type = item.movie ? "movie" : item.series ? "series" : "episode"
                        const href = item.movie
                            ? `/stream/watch/movie/${item.movie.id}`
                            : item.series
                                ? `/stream/watch/series/${item.series.id}`
                                : item.episode
                                    ? `/stream/watch/episode/${item.episode.id}`
                                    : "#"
                        return (
                            <Link key={item.id} href={href} className="flex-shrink-0 w-[180px] transition transform hover:scale-105">
                                <div className="relative aspect-[2/3] rounded-md overflow-hidden">
                                    <Image
                                        src={content?.poster_url || "/generic-movie-poster.png"}
                                        alt={content?.title || "Poster"}
                                        fill
                                        className="object-cover group-hover:opacity-80 transition" />
                                </div>
                                <div className="mt-2">
                                    <h3 className="font-medium text-sm truncate">{content?.title}</h3>
                                    <p className="text-xs text-gray-400 capitalize">{type}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-400 flex-wrap">
                                        <span>{content?.release_year}</span>
                                        {content?.genres && content.genres.length > 0 && (
                                            <>
                                                <span>•</span>
                                                <span className="flex gap-1 flex-wrap">
                                                    {content.genres.map((g: any) => (
                                                        <span key={g.id} className="bg-gray-200 text-gray-700 rounded px-2 py-0.5 text-xs mr-1 mb-1">
                                                            {g.name}
                                                        </span>
                                                    ))}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
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
