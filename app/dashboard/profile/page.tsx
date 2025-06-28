import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your profile",
}

export default async function ProfilePage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: user } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Email</h3>
            <p>{user?.user?.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Account ID</h3>
            <p className="text-sm text-muted-foreground">{user?.user?.id}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Last Sign In</h3>
            <p className="text-sm text-muted-foreground">
              {user?.user?.last_sign_in_at ? new Date(user.user.last_sign_in_at).toLocaleString() : "Not available"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
