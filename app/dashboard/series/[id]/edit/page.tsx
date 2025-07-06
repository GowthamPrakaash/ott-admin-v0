import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { SeriesForm } from "@/components/series/series-form"

interface EditSeriesPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditSeriesPageProps): Promise<Metadata> {
  const awaitedParams = await params;
  const series = await prisma.series.findUnique({ where: { id: awaitedParams.id } })

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
  const awaitedParams = await params;

  // Fetch series using Prisma
  const series = await prisma.series.findUnique({
    where: { id: awaitedParams.id },
    include: { genres: true }
  })
  if (!series) return null

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
