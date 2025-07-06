import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { Resend } from "resend"
import crypto from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
    try {
        const { username, email, password, resendVerification } = await req.json()
        if (!username || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }
        const existing = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        })
        if (existing) {
            // If user exists but not verified, always allow resending verification email
            if (!existing.emailVerified) {
                // Mark all previous tokens as disabled
                await prisma.verificationToken.updateMany({
                    where: { identifier: email, disabled: false },
                    data: { disabled: true },
                })
                // Generate new token
                const token = crypto.randomBytes(32).toString("hex")
                const expires = new Date(Date.now() + 1000 * 60 * 60 * 24)
                await prisma.verificationToken.create({
                    data: { identifier: email, token, expires },
                })
                // Send verification email
                const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/verify-email?token=${token}`
                await resend.emails.send({
                    from: process.env.RESEND_EMAIL_FROM || "",
                    to: email,
                    subject: "Verify your email for OTT Admin",
                    html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email address for OTT Admin.</p><p>This link will expire in 24 hours.</p>`
                })
                return NextResponse.json({ success: true, resent: true })
            }
            return NextResponse.json({ error: "User with this email or username already exists" }, { status: 400 })
        }
        const hashed = await bcrypt.hash(password, 10)
        await prisma.user.create({
            data: {
                username,
                email,
                password: hashed,
                emailVerified: null,
            },
        })
        // Mark any old tokens as disabled (shouldn't exist, but for safety)
        await prisma.verificationToken.updateMany({ where: { identifier: email, disabled: false }, data: { disabled: true } })
        // Generate verification token
        const token = crypto.randomBytes(32).toString("hex")
        const expires = new Date(Date.now() + 1000 * 60 * 60 * 24)
        await prisma.verificationToken.create({
            data: { identifier: email, token, expires },
        })
        // Send verification email
        const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/verify-email?token=${token}`
        await resend.emails.send({
            from: process.env.RESEND_EMAIL_FROM || "",
            to: email,
            subject: "Verify your email for OTT Admin",
            html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email address for OTT Admin.</p><p>This link will expire in 24 hours.</p>`
        })
        return NextResponse.json({ success: true })
    } catch (e) {
        console.error("Signup error:", e)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
