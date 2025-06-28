import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SeriesForm } from "@/components/series/series-form"

interface EditSeriesPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: EditSeriesPageProps): Promise<Metadata> {
  const supabase = createClient()

  const { data: series } = await supabase.from("series").select("title").eq("id", params.id).single()

  if (!series) {
    return {
      title: "Series Not Found",
    }
  }

  return {
    title: `Edit ${series.title}`,
    description: `Edit series details for ${series.title}`,
  }
}

export default async function EditSeriesPage({ params }: EditSeriesPageProps) {
  const supabase = createClient()

  const { data: series, error } = await supabase.from("series").select("*").eq("id", params.id).single()

  if (error || !series) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Series</h1>
        <p className="text-muted-foreground">Update series details for {series.title}</p>
      </div>

      <div className="mx-auto max-w-3xl">
        <SeriesForm series={series} />
      </div>
    </div>
  )
}
