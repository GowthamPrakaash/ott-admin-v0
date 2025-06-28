import type { Metadata } from "next"
import { MovieForm } from "@/components/movies/movie-form"

export const metadata: Metadata = {
  title: "Add Movie",
  description: "Add a new movie to your platform",
}

export default function NewMoviePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Movie</h1>
        <p className="text-muted-foreground">Add a new movie to your platform</p>
      </div>

      <div className="mx-auto max-w-3xl">
        <MovieForm />
      </div>
    </div>
  )
}
