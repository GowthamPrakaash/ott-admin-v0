import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  // NextAuth handles its own OAuth callbacks. Redirect to dashboard.
  return Response.redirect('/dashboard')
}
