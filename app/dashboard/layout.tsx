export const dynamic = "force-dynamic"
import type React from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { SidebarProvider } from "@/components/sidebar-provider"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login?redirectTo=/dashboard")
  }
  // Use role from session
  const userRole = session.user?.role || "viewer"
  if (userRole !== "admin" && userRole !== "editor") {
    redirect("/stream")
  }
  return (
    <SidebarProvider isAdmin={userRole === "admin"}>
      <div className="min-h-screen bg-muted/40">
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </SidebarProvider>
  )
}
