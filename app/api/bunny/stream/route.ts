import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

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

    // Get request body
    const { title, contentType } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Determine collection ID based on content type
    let collectionId = null
    if (contentType === "movie") {
      collectionId = process.env.BUNNY_MOVIE_COLLECTION_ID || null
    } else if (contentType === "episode") {
      collectionId = process.env.BUNNY_EPISODE_COLLECTION_ID || null
    }

    // Create a video in Bunny Stream with timestamped title
    const libraryId = process.env.BUNNY_LIBRARY_ID
    const now = new Date()
    const timestamp = now.toISOString().replace(/[:.]/g, "-")
    const timestampedTitle = `${timestamp}-${title}`

    const createResponse = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
      method: "POST",
      headers: {
        AccessKey: process.env.BUNNY_STREAM_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: timestampedTitle,
        collectionId,
      }),
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      throw new Error(`Failed to create video: ${createResponse.statusText} - ${errorText}`)
    }

    const videoData = await createResponse.json()
    const videoId = videoData.guid

    // Generate authentication signature
    const authTimestamp = Math.floor(Date.now() / 1000)
    const expirationTimestamp = authTimestamp + 3600 // 1 hour expiration

    const signatureData = `${videoId}${authTimestamp}${expirationTimestamp}`
    const signature = crypto.createHmac("sha256", process.env.BUNNY_STREAM_API_KEY!).update(signatureData).digest("hex")

    // Construct the direct upload URL with library ID
    const uploadUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`

    return NextResponse.json({
      videoId,
      tusUploadUrl: uploadUrl,
      authTimestamp,
      expirationTimestamp,
      signature,
      expires: new Date(expirationTimestamp * 1000).toISOString(),
    })
  } catch (error: any) {
    console.error("Error generating upload URL:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
