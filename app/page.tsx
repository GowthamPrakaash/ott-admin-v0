import { redirect } from "next/navigation"

// TODO: Replace with your own session logic
// For now, always redirect to /stream
export default async function Home() {
  redirect("/stream")
}
