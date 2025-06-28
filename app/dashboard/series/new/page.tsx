import type { Metadata } from "next"
import { SeriesForm } from "@/components/series/series-form"

export const metadata: Metadata = {
  title: "Add Series",
  description: "Add a new series to your platform",
}

export default function NewSeriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Series</h1>
        <p className="text-muted-foreground">Add a new series to your platform</p>
      </div>

      <div className="mx-auto max-w-3xl">
        <SeriesForm />
      </div>
    </div>
  )
}
