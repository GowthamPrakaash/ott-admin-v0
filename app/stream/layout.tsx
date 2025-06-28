import type React from "react"
import Link from "next/link"
import { Film, Home, Search, Tv, User } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { ThemeProvider } from "@/components/theme-provider"
import "./stream.css"
import { Suspense } from "react"

export const metadata = {
  title: "Apsara Streaming",
  description: "Watch movies and series on Apsara",
}

export default async function StreamLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/stream" className="text-2xl font-bold text-red-600">
                APSARA
              </Link>

              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/stream" className="text-sm font-medium hover:text-white/80 transition">
                  Home
                </Link>
                <Link href="/stream/movies" className="text-sm font-medium hover:text-white/80 transition">
                  Movies
                </Link>
                <Link href="/stream/series" className="text-sm font-medium hover:text-white/80 transition">
                  Series
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/stream/search" className="p-2 hover:bg-white/10 rounded-full transition">
                <Search className="h-5 w-5" />
              </Link>
              <Link href="/stream/profile" className="p-2 hover:bg-white/10 rounded-full transition">
                <User className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </header>

        {/* Mobile navigation */}
        <div className="fixed bottom-0 w-full z-50 bg-black/90 backdrop-blur-sm md:hidden">
          <div className="flex items-center justify-around py-3">
            <Link href="/stream" className="flex flex-col items-center">
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link href="/stream/movies" className="flex flex-col items-center">
              <Film className="h-5 w-5" />
              <span className="text-xs mt-1">Movies</span>
            </Link>
            <Link href="/stream/series" className="flex flex-col items-center">
              <Tv className="h-5 w-5" />
              <span className="text-xs mt-1">Series</span>
            </Link>
            <Link href="/stream/profile" className="flex flex-col items-center">
              <User className="h-5 w-5" />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </div>
        </div>

        {/* Main content */}
        <main className="pt-16 pb-16 md:pb-0">
          <Suspense>{children}</Suspense>
        </main>
      </div>
    </ThemeProvider>
  )
}
