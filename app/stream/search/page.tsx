"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { ContentGrid } from "@/components/stream/content-grid"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setResults([])
        return
      }

      setLoading(true)

      try {
        // Search movies
        const { data: movies } = await supabase
          .from("movies")
          .select("*")
          .eq("status", "published")
          .ilike("title", `%${query}%`)
          .order("created_at", { ascending: false })

        // Search series
        const { data: series } = await supabase
          .from("series")
          .select("*")
          .eq("status", "published")
          .ilike("title", `%${query}%`)
          .order("created_at", { ascending: false })

        // Combine results
        const combinedResults = [
          ...(movies || []).map((item) => ({ ...item, contentType: "movie" })),
          ...(series || []).map((item) => ({ ...item, contentType: "series" })),
        ]

        setResults(combinedResults)
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
      }
    }

    // Debounce search
    const timer = setTimeout(() => {
      performSearch()
    }, 300)

    return () => clearTimeout(timer)
  }, [query, supabase])

  // Update URL with search query
  useEffect(() => {
    if (query) {
      const url = new URL(window.location.href)
      url.searchParams.set("q", query)
      window.history.replaceState({}, "", url.toString())
    } else {
      const url = new URL(window.location.href)
      url.searchParams.delete("q")
      window.history.replaceState({}, "", url.toString())
    }
  }, [query])

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Search</h1>

      <div className="relative max-w-2xl mx-auto mb-12">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          placeholder="Search for movies, series, genres..."
          className="pl-10 bg-gray-900 border-gray-700 h-12"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Searching...</p>
        </div>
      ) : results.length > 0 ? (
        <div>
          <p className="text-sm text-gray-400 mb-6">
            Found {results.length} results for "{query}"
          </p>
          <ContentGrid
            items={results.map((item) => ({
              ...item,
              type: item.contentType,
            }))}
            type="movie"
          />
        </div>
      ) : query ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No results found for "{query}"</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">Start typing to search</p>
        </div>
      )}
    </div>
  )
}
