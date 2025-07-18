import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { Resend } from "resend"
import crypto from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY)

// Enhanced verification email template
const createVerificationEmailTemplate = (verifyUrl: string, username: string) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Apsara Entertainment</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 8px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #1f2937;
        }
        .message {
            font-size: 16px;
            line-height: 1.6;
            color: #4b5563;
            margin-bottom: 30px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-1px);
        }
        .alternative-link {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 20px;
            margin: 30px 0;
            word-break: break-all;
        }
        .alternative-link p {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #6b7280;
        }
        .alternative-link a {
            color: #dc2626;
            text-decoration: none;
            font-size: 13px;
        }
        .security-info {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px 20px;
            margin: 30px 0;
            border-radius: 0 6px 6px 0;
        }
        .security-info h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
            color: #92400e;
        }
        .security-info p {
            margin: 0;
            font-size: 14px;
            color: #a16207;
        }
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            margin: 0;
            font-size: 14px;
            color: #6b7280;
        }
        .footer a {
            color: #dc2626;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .content {
                padding: 30px 20px;
            }
            .header {
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎬 Apsara Entertainment</h1>
            <p>Your Premium Streaming Experience</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hello ${username}! 👋
            </div>
            
            <div class="message">
                Welcome to Apsara Entertainment! To complete your registration and start enjoying streaming, please verify your email address by clicking the button below.
            </div>
            
            <div style="text-align: center;">
                <a href="${verifyUrl}" class="cta-button">
                    ✅ Verify Email Address
                </a>
            </div>
            
            <div class="alternative-link">
                <p><strong>Having trouble with the button?</strong> Copy and paste this link into your browser:</p>
                <a href="${verifyUrl}">${verifyUrl}</a>
            </div>
            
            <div class="security-info">
                <h3>🔒 Security Information</h3>
                <p>This verification link will expire in 24 hours for your security. If you didn't create an account with us, please ignore this email.</p>
            </div>
            
            <div class="message">
                Once verified, you'll have access to movies and series streaming
            </div>
            
            <div class="message">
                Get ready to dive into a world of entertainment with Apsara Entertainment's vast library of premium content!
            </div>
        </div>
        
        <div class="footer">
            <p>
                If you have any questions, feel free to contact our support team.<br>
                This email was sent to you because you registered for an Apsara Entertainment account.
            </p>
        </div>
    </div>
</body>
</html>
    `;
};

export async function POST(req: NextRequest) {
    try {
        const { username, email, password } = await req.json()
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
                    subject: "🎬 Verify your email for Apsara Entertainment",
                    html: createVerificationEmailTemplate(verifyUrl, existing.username),
                    text: `Hello ${existing.username}!\n\nWelcome to Apsara Entertainment! Please verify your email address by clicking this link: ${verifyUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account with us, please ignore this email.\n\nBest regards,\nApsara Entertainment Team`
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
            subject: "🎬 Verify your email for Apsara Entertainment",
            html: createVerificationEmailTemplate(verifyUrl, username),
            text: `Hello ${username}!\n\nWelcome to Apsara Entertainment! Please verify your email address by clicking this link: ${verifyUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account with us, please ignore this email.\n\nBest regards,\nApsara Entertainment Team`
        })
        return NextResponse.json({ success: true })
    } catch (e) {
        console.error("Signup error:", e)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
