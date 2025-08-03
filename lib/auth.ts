import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { Resend } from "resend"
import { getServerSession } from "next-auth"
import { NextRequest } from "next/server"

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null
                const user = await prisma.user.findUnique({ where: { email: credentials.email } })
                if (!user) return null
                if (!user.emailVerified) throw new Error("EMAIL_NOT_VERIFIED") // Only allow login if email is verified
                const valid = await bcrypt.compare(credentials.password, user.password)
                if (!valid) return null
                return { id: user.id, email: user.email, name: user.username }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub
                // Fetch the user's role from ManagedRole and add to session
                if (session.user.email) {
                    const managed = await prisma.managedRole.findUnique({ where: { email: session.user.email } })
                    session.user.role = managed?.role || "viewer"
                }
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
        signOut: "/login",
        error: "/login",
    },
}

export async function isAdmin(req: NextRequest) {
    console.log("isAdmin called")
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return false
    const managed = await prisma.managedRole.findUnique({ where: { email: session.user.email } })
    return managed?.role === "admin"
}

export async function isEditor(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return false
    const managed = await prisma.managedRole.findUnique({ where: { email: session.user.email } })
    return managed?.role === "editor"
}

export async function isAdminOrEditor(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return false
    const managed = await prisma.managedRole.findUnique({ where: { email: session.user.email } })
    return managed?.role === "admin" || managed?.role === "editor"
}

export async function canWatchVideos(email: string): Promise<boolean> {
    // Check if user has admin or editor role
    const managed = await prisma.managedRole.findUnique({ where: { email } })
    if (managed?.role === "admin" || managed?.role === "editor") {
        return true
    }

    // Check if user has active subscription
    const user = await prisma.user.findUnique({
        where: { email },
        select: { subscriptionStatus: true, subscriptionExpiry: true }
    })

    if (!user) return false

    return user.subscriptionStatus === "active" &&
        user.subscriptionExpiry &&
        user.subscriptionExpiry > new Date()
}

export async function getUserSubscriptionStatus(email: string) {
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            subscriptionStatus: true,
            subscriptionExpiry: true,
            id: true
        }
    })

    const managed = await prisma.managedRole.findUnique({ where: { email } })

    return {
        user,
        role: managed?.role || "viewer",
        canWatch: await canWatchVideos(email)
    }
}
