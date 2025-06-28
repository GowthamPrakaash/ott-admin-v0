import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { InviteForm } from "@/components/invites/invite-form"
import { InviteList } from "@/components/invites/invite-list"

export const metadata: Metadata = {
  title: "Invite Users",
  description: "Generate invite links for new users",
}

export default async function InvitesPage() {
  const supabase = createClient()

  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Check if user is admin
  const { data: userRole } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).single()

  if (!userRole || userRole.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invite Users</h1>
        <p className="text-muted-foreground">Generate invite links for new users</p>
      </div>

      <InviteForm userId={session.user.id} />
      <InviteList />
    </div>
  )
}
