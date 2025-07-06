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
