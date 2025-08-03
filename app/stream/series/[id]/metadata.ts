import { prisma } from "@/lib/prisma"

export async function generateMetadata({ params }: { params: { id: string } }) {
  const series = await prisma.series.findUnique({
    where: { id: params.id },
    select: { title: true, meta_title: true },
  })

  if (!series) {
    return {
      title: "Series Not Found",
    }
  }

  return {
    title: `${series.meta_title || series.title} | Apsara Entertainment`,
  }
}
