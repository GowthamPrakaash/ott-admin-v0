import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    // Verify authentication
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Return the access key from environment variables
    return NextResponse.json({
      accessKey: process.env.BUNNY_STREAM_API_KEY,
    })
  } catch (error: any) {
    console.error("Error getting access key:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
