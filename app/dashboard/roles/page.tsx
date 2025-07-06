import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { RoleManager } from "@/components/dashboard/role-manager"

export default async function RolesPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) redirect("/login?redirectTo=/dashboard/roles")
    const userRole = session.user?.role || "viewer"
    if (userRole === "admin") {
        return <RoleManager />
    } else if (userRole === "editor") {
        redirect("/dashboard")
    } else {
        redirect("/stream")
    }
}
