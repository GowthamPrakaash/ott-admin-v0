import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SidebarProvider } from "@/components/sidebar-provider"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirectTo=/dashboard")
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-muted/40">
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </SidebarProvider>
  )
}
