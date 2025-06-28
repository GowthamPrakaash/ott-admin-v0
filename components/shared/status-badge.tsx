import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={status === "published" ? "default" : "secondary"} className={className}>
      {status === "published" ? "Published" : "Draft"}
    </Badge>
  )
}
