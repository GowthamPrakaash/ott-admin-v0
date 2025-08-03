import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/auth"

// GET: List all managed roles
export async function GET(req: NextRequest) {
    if (!(await isAdmin(req))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    const roles = await prisma.managedRole.findMany({ orderBy: { createdAt: "asc" } })
    return NextResponse.json(roles)
}

// POST: Add or update a managed role
export async function POST(req: NextRequest) {
    if (!(await isAdmin(req))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    const { email, role } = await req.json()
    if (!email || !["admin", "editor"].includes(role)) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }
    const existing = await prisma.managedRole.findUnique({ where: { email } })
    if (existing) {
        return NextResponse.json({
            error: "Role already exists for this email. Remove it first if you want to update.",
        }, { status: 400 })
    }
    const managed = await prisma.managedRole.create({
        data: { email, role },
    })
    return NextResponse.json(managed)
}

// DELETE: Remove a managed role (reverts user to viewer)
export async function DELETE(req: NextRequest) {
    if (!(await isAdmin(req))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    const { email } = await req.json()
    if (!email) {
        return NextResponse.json({ error: "Email required" }, { status: 400 })
    }
    // Prevent removing the last admin
    const adminCount = await prisma.managedRole.count({ where: { role: "admin" } })
    const isTargetAdmin = !!(await prisma.managedRole.findFirst({ where: { email, role: "admin" } }))
    if (isTargetAdmin && adminCount <= 1) {
        return NextResponse.json({ error: "Cannot remove the last admin." }, { status: 400 })
    }
    await prisma.managedRole.deleteMany({ where: { email } })
    return NextResponse.json({ success: true })
}
