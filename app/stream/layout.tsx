'use client';

export const dynamic = "force-dynamic"

import type React from "react"
import Link from "next/link"
import { Film, Home, Search, Tv, User, Settings } from "lucide-react"
import { ThemeProvider } from "@/components/theme-provider"
import "./stream.css"
import { Suspense } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

// export const metadata = {
//   title: "Apsara Entertainment",
//   description: "Watch movies and series on Apsara",
// }

export default function StreamLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { data: session } = useSession()
  const userRole = session?.user?.role || "viewer"
  const isAdminOrEditor = userRole === "admin" || userRole === "editor"

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
              {/* Hamburger for mobile */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="p-2 rounded-md hover:bg-white/10 focus:outline-none">
                      <Menu className="h-6 w-6" />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-64 bg-black">
                    <nav className="flex flex-col gap-2 p-6">
                      <Link href="/stream" className="text-lg font-medium py-2">
                        Home
                      </Link>
                      <Link href="/stream/movies" className="text-lg font-medium py-2">
                        Movies
                      </Link>
                      <Link href="/stream/series" className="text-lg font-medium py-2">
                        Series
                      </Link>
                      <Link href="/stream/profile" className="text-lg font-medium py-2">
                        Profile
                      </Link>
                      <Link href="/stream/search" className="text-lg font-medium py-2">
                        Search
                      </Link>
                      {!session && (
                        <Link href="/stream/login" className="text-lg font-medium py-2">
                          Login
                        </Link>
                      )}
                      {isAdminOrEditor && (
                        <Link href="/dashboard" className="text-lg font-medium py-2 text-blue-400">
                          Go to Admin Dashboard
                        </Link>
                      )}
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>

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

              {/* Dashboard button for admin/editor users */}
              {isAdminOrEditor && (
                <Button asChild variant="outline" size="sm" className="hidden md:flex">
                  <Link href="/dashboard">
                    <Settings className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Link>
                </Button>
              )}

              {session ? (
                <Link href="/stream/profile" className="p-2 hover:bg-white/10 rounded-full transition flex items-center justify-center w-9 h-9 bg-white/10 rounded-full">
                  <span className="font-bold text-lg uppercase">
                    {session.user?.name?.[0] || session.user?.email?.[0] || <User className="h-5 w-5" />}
                  </span>
                </Link>
              ) : (
                <Link href="/stream/login" className="p-2 hover:bg-white/10 rounded-full transition">
                  Login
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Mobile navigation */}
        <div className="fixed bottom-0 w-full z-50 bg-black/90 backdrop-blur-sm md:hidden">
          <div className={`flex items-center justify-around py-3 ${isAdminOrEditor ? 'px-2' : 'px-4'}`}>
            <Link href="/stream" className="flex flex-col items-center min-w-0">
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link href="/stream/movies" className="flex flex-col items-center min-w-0">
              <Film className="h-5 w-5" />
              <span className="text-xs mt-1">Movies</span>
            </Link>
            <Link href="/stream/series" className="flex flex-col items-center min-w-0">
              <Tv className="h-5 w-5" />
              <span className="text-xs mt-1">Series</span>
            </Link>
            <Link href="/stream/profile" className="flex flex-col items-center min-w-0">
              <User className="h-5 w-5" />
              <span className="text-xs mt-1">Profile</span>
            </Link>
            {isAdminOrEditor && (
              <Link href="/dashboard" className="flex flex-col items-center min-w-0">
                <Settings className="h-5 w-5" />
                <span className="text-xs mt-1">Admin</span>
              </Link>
            )}
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
