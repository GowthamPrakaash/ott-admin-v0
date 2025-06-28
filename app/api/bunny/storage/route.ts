import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the form data with the file
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Read the file as buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Generate a unique filename with detailed timestamp
    const now = new Date()
    const timestamp = now.toISOString().replace(/[:.]/g, "-")
    const fileExtension = file.name.split(".").pop()
    const fileName = `${timestamp}-${file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "-")}.${fileExtension}`

    // Upload to Bunny Storage
    const response = await fetch(
      `https://${process.env.BUNNY_STORAGE_HOST}/${process.env.BUNNY_STORAGE_ZONE}/images/${fileName}`,
      {
        method: "PUT",
        headers: {
          AccessKey: process.env.BUNNY_STORAGE_KEY!,
          "Content-Type": file.type,
        },
        body: buffer,
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to upload to Bunny Storage: ${response.statusText}`)
    }

    // Construct the public URL
    // In a real implementation, this would be your Bunny Storage pull zone URL
    const publicUrl = `https://${process.env.BUNNY_STORAGE_ZONE}.b-cdn.net/images/${fileName}`

    return NextResponse.json({
      success: true,
      publicUrl,
    })
  } catch (error: any) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
