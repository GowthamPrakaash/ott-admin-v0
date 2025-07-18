"use client"
import { useEffect, useState } from "react"
import { WatchHistoryList } from "@/components/stream/watch-history-list"

export function RecentWatchHistory() {
    const [history, setHistory] = useState<any[]>([])
    useEffect(() => {
        fetch("/api/history")
            .then((res) => res.json())
            .then((data) => {
                setHistory(data.recent || [])
            })
    }, [])
    return (
        <>
            {history.length > 0 && (
                <div className="container px-4">
                    <WatchHistoryList history={history} />
                </div>
            )}
        </>
    )
}
