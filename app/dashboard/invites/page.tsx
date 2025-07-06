import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { InviteForm } from "@/components/invites/invite-form"
import { InviteList } from "@/components/invites/invite-list"

export const metadata: Metadata = {
  title: "Invite Users",
  description: "Generate invite links for new users",
}

export default async function InvitesPage() {
  // Fetch user session and role using NextAuth and Prisma if needed
  // Example: const session = await getServerSession(authOptions)
  // const userRole = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })

  // Fetch invites using Prisma
  const invites = await prisma.inviteToken.findMany({
    orderBy: { created_at: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invite Users</h1>
        <p className="text-muted-foreground">Generate invite links for new users</p>
      </div>

      <InviteForm />
      <InviteList invites={invites} />
    </div>
  )
}
