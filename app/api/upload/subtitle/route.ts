import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { isAdmin } from "@/lib/auth"

export async function POST(request: NextRequest) {
    if (!(await isAdmin(request))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 })

    // Validate file extension is .vtt (WebVTT format only)
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
    if (fileExtension !== ".vtt") {
        return NextResponse.json({ error: "Only WebVTT (.vtt) files are supported" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileName = `${Date.now()}-${file.name}`
    const uploadDir = path.join(process.cwd(), "data", "subtitles")
    await fs.mkdir(uploadDir, { recursive: true })
    const filePath = path.join(uploadDir, fileName)
    await fs.writeFile(filePath, buffer)

    return NextResponse.json({ url: `/api/data/subtitles/${fileName}` })
}