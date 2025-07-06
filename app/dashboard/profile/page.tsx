import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your profile",
}

export default async function ProfilePage() {
  // TODO: Replace with your own session logic
  // For now, fetch the first user as a placeholder
  const user = await prisma.user.findFirst()
  if (!user) {
    redirect("/login")
  }
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
            <p>{user.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Account ID</h3>
            <p className="text-sm text-muted-foreground">{user.id}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Created At</h3>
            <p className="text-sm text-muted-foreground">{user.createdAt.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
