import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get("token")
    const baseUrl = req.nextUrl.origin
    if (!token) {
        return NextResponse.redirect(`${baseUrl}/login?error=Missing+verification+token`)
    }
    const record = await prisma.verificationToken.findFirst({ where: { token, disabled: false } })
    if (!record || record.expires < new Date()) {
        return NextResponse.redirect(`${baseUrl}/login?error=Invalid+or+expired+verification+token`)
    }
    // Mark this token as disabled after use
    await prisma.verificationToken.update({ where: { token }, data: { disabled: true } })
    await prisma.user.update({
        where: { email: record.identifier },
        data: { emailVerified: new Date() },
    })
    // If no admin/editor exists, make this verified user the first admin
    const managedCount = await prisma.managedRole.count()
    if (managedCount === 0) {
        await prisma.managedRole.create({
            data: { email: record.identifier, role: "admin" }
        })
    }
    return NextResponse.redirect(`${baseUrl}/login?success=Email+verified+successfully`)
}
