import type { Metadata } from "next"
import MoviesPageClient from "./MoviesPageClient"

export const metadata: Metadata = {
  title: "Movies",
  description: "Manage your movies",
}

export default async function MoviesPage({
  searchParams,
}: {
  searchParams?: { status?: string }
}) {
  return <MoviesPageClient searchParams={searchParams} />
}
