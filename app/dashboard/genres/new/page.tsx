import type { Metadata } from "next"
import { GenreForm } from "@/components/genres/genre-form"

export const metadata: Metadata = {
  title: "Add Genre",
  description: "Add a new genre to your platform",
}

export default function NewGenrePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Genre</h1>
        <p className="text-muted-foreground">Add a new genre to your platform</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <GenreForm />
      </div>
    </div>
  )
}
