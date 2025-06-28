import type { Metadata } from "next"
import SeriesClientPage from "./SeriesClientPage"

export const metadata: Metadata = {
  title: "Series",
  description: "Manage your series",
}

export default async function SeriesPage({
  searchParams,
}: {
  searchParams?: { status?: string }
}) {
  return <SeriesClientPage searchParams={searchParams} />
}
