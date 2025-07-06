"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Film, Home, Layers, Link2, LogOut, Menu, PlusCircle, Settings, Tv, User, Video, Moon } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSession } from "next-auth/react"

interface SidebarProps {
  isOpen: boolean
  toggleSidebar: () => void
  isAdmin?: boolean // Optional prop to pass user role
}

export function Sidebar({ isOpen, toggleSidebar, isAdmin }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: sessionData } = useSession()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)

    if (sessionData?.user) {
      setUserEmail(sessionData.user.email)
    }

    setIsLoading(false)
  }, [sessionData])

  const handleSignOut = async () => {
    // Sign out logic here (e.g., call to NextAuth signOut function)
    router.push("/login")
    router.refresh()
  }

  // Fix the isActive function to be more precise
  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname === path
  }

  // Get first letter of email for avatar
  const getInitial = () => {
    if (!userEmail) return "U"
    return userEmail.charAt(0).toUpperCase()
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={toggleSidebar} />}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full bg-background border-r transition-transform duration-300 ease-in-out ${isOpen ? "w-64" : "w-16"
          }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <div className="flex items-center gap-2">
            {/* Sidebar trigger moved to header */}
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-1">
              <Menu className="h-5 w-5" />
            </Button>
            {isOpen && (
              <Link href="/dashboard" className="flex items-center">
                <span className="text-xl font-bold">OTT Admin</span>
              </Link>
            )}
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="px-3 py-4">
            <nav className="space-y-1">
              <NavItem
                href="/dashboard"
                icon={<Home className="h-5 w-5" />}
                title="Dashboard"
                isActive={isActive("/dashboard")}
                isOpen={isOpen}
              />

              <div className="pt-4">
                <h3 className={`mb-2 px-2 text-xs font-semibold text-muted-foreground ${!isOpen && "sr-only"}`}>
                  Movies
                </h3>
                <NavItem
                  href="/dashboard/movies"
                  icon={<Film className="h-5 w-5" />}
                  title="Movies"
                  isActive={isActive("/dashboard/movies")}
                  isOpen={isOpen}
                />
                <NavItem
                  href="/dashboard/movies/new"
                  icon={<PlusCircle className="h-5 w-5" />}
                  title="Add Movie"
                  isActive={isActive("/dashboard/movies/new")}
                  isOpen={isOpen}
                />
              </div>

              <div className="py-2">
                <Separator className="my-2" />
              </div>

              <div>
                <h3 className={`mb-2 px-2 text-xs font-semibold text-muted-foreground ${!isOpen && "sr-only"}`}>
                  Series
                </h3>
                <NavItem
                  href="/dashboard/series"
                  icon={<Tv className="h-5 w-5" />}
                  title="Series"
                  isActive={isActive("/dashboard/series")}
                  isOpen={isOpen}
                />
                <NavItem
                  href="/dashboard/series/new"
                  icon={<PlusCircle className="h-5 w-5" />}
                  title="Add Series"
                  isActive={isActive("/dashboard/series/new")}
                  isOpen={isOpen}
                />
                <NavItem
                  href="/dashboard/episodes/new"
                  icon={<Video className="h-5 w-5" />}
                  title="Add Episode"
                  isActive={isActive("/dashboard/episodes/new")}
                  isOpen={isOpen}
                />
              </div>

              <div className="py-2">
                <Separator className="my-2" />
              </div>

              <div>
                <h3 className={`mb-2 px-2 text-xs font-semibold text-muted-foreground ${!isOpen && "sr-only"}`}>
                  Genres
                </h3>
                <NavItem
                  href="/dashboard/genres"
                  icon={<Layers className="h-5 w-5" />}
                  title="Genres"
                  isActive={isActive("/dashboard/genres")}
                  isOpen={isOpen}
                />
                <NavItem
                  href="/dashboard/genres/new"
                  icon={<PlusCircle className="h-5 w-5" />}
                  title="Add Genre"
                  isActive={isActive("/dashboard/genres/new")}
                  isOpen={isOpen}
                />
              </div>

              <div className="pt-4">
                <h3 className={`mb-2 px-2 text-xs font-semibold text-muted-foreground ${!isOpen && "sr-only"}`}>
                  System
                </h3>
                {isAdmin && (
                  <NavItem
                    href="/dashboard/roles"
                    icon={<User className="h-5 w-5" />}
                    title="Roles"
                    isActive={isActive("/dashboard/roles")}
                    isOpen={isOpen}
                  />
                )}
                <a
                  href="/stream"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground ${!isOpen && "justify-center px-2"}`}
                >
                  <Film className="h-5 w-5" />
                  {isOpen && <span>Take me to OTT</span>}
                </a>

                {/* Add Theme Toggle */}
                {/* <div
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground ${!isOpen && "justify-center px-2"}`}
                >
                  {isOpen ? (
                    <>
                      <Moon className="h-5 w-5" />
                      <span className="mr-auto">Theme</span>
                      <ThemeToggle />
                    </>
                  ) : (
                    <ThemeToggle />
                  )}
                </div> */}
              </div>
            </nav>
          </div>
        </ScrollArea>

        {/* User profile section at bottom - only show if user is logged in */}
        {userEmail && (
          <div className="absolute bottom-0 w-full border-t p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitial()}</AvatarFallback>
                    </Avatar>
                    {isOpen && (
                      <div className="flex flex-col items-start text-left">
                        <span className="text-sm font-medium truncate max-w-[180px]">{userEmail}</span>
                        {isAdmin && <span className="text-xs text-muted-foreground">Admin</span>}
                      </div>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/dashboard/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </aside>
    </>
  )
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  title: string
  isActive: boolean
  isOpen: boolean
}

function NavItem({ href, icon, title, isActive, isOpen }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
        } ${!isOpen && "justify-center px-2"}`}
    >
      {icon}
      {isOpen && <span>{title}</span>}
    </Link>
  )
}
