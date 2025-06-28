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

    // Parse the multipart form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const videoId = formData.get("videoId") as string
    const language = formData.get("language") as string
    const label = formData.get("label") as string

    if (!file || !videoId || !language) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Read the file content
    const fileContent = await file.text()

    // Base64 encode the file content
    const base64Content = Buffer.from(fileContent).toString("base64")

    // Upload the subtitle to Bunny Stream
    const libraryId = process.env.BUNNY_LIBRARY_ID
    const response = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}/captions/${language}`,
      {
        method: "POST",
        headers: {
          AccessKey: process.env.BUNNY_STREAM_API_KEY!,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        // Send the data in the format expected by the Bunny API
        body: JSON.stringify({
          srclang: language,
          captionsFile: base64Content,
          label: label,
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to upload subtitle: ${response.statusText} - ${errorText}`)
    }

    return NextResponse.json({
      success: true,
      language,
      label,
    })
  } catch (error: any) {
    console.error("Error uploading subtitle:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const videoId = searchParams.get("videoId")
    const language = searchParams.get("language")

    if (!videoId || !language) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Delete the subtitle from Bunny Stream
    const libraryId = process.env.BUNNY_LIBRARY_ID
    const url = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}/captions/${language}`

    console.log(`Attempting to delete subtitle: ${url}`)

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        AccessKey: process.env.BUNNY_STREAM_API_KEY!,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Bunny API error: Status ${response.status}, Response: ${errorText}`)
      throw new Error(`Failed to delete subtitle: ${response.status} ${response.statusText} - ${errorText}`)
    }

    console.log(`Successfully deleted subtitle for language: ${language}`)

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    console.error("Error deleting subtitle:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
