"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"

interface SidebarProviderProps {
  children: React.ReactNode
  isAdmin?: boolean // Optional prop to pass user role
}

export function SidebarProvider({ children, isAdmin }: SidebarProviderProps) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Close sidebar on mobile when navigating
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Close sidebar on navigation on mobile
  React.useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }, [pathname])

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} isAdmin={isAdmin} />
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>{children}</div>
    </div>
  )
}
