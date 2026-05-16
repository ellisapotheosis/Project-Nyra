import { Badge } from "../ui/badge"
import { cn } from "@/lib/utils"

type ComplianceState = "clear" | "warning" | "blocked" | "unknown"

const styles: Record<ComplianceState, string> = {
  clear: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  warning: "border-primary/35 bg-primary/10 text-primary",
  blocked: "border-destructive/35 bg-destructive/10 text-destructive",
  unknown: "border-border/50 bg-background/50 text-muted-foreground",
}

export function ComplianceBadge({
  label,
  state = "unknown",
  className,
}: {
  label: string
  state?: ComplianceState
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn("h-6 rounded-lg px-2 text-[10px] font-black uppercase tracking-[0.12em]", styles[state], className)}
    >
      {label}
    </Badge>
  )
}
