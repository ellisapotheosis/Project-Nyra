import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const statusStyles: Record<string, string> = {
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  complete: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  running: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  qualified: "border-primary/35 bg-primary/10 text-primary",
  application: "border-primary/35 bg-primary/10 text-primary",
  paused: "border-primary/20 bg-background/50 text-primary",
  pending: "border-primary/35 bg-primary/10 text-primary",
  draft: "border-border/50 bg-background/50 text-muted-foreground",
  stopped: "border-destructive/35 bg-destructive/10 text-destructive",
  blocked: "border-destructive/35 bg-destructive/10 text-destructive",
  failed: "border-destructive/35 bg-destructive/10 text-destructive",
}

export function StatusBadge({ status, className }: { status?: string | null; className?: string }) {
  const normalized = (status || "unknown").toLowerCase()
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 rounded-lg px-2 text-[10px] font-black uppercase tracking-[0.12em]",
        statusStyles[normalized] ?? "border-border/50 bg-background/50 text-muted-foreground",
        className,
      )}
    >
      {status?.toUpperCase() || "UNKNOWN"}
    </Badge>
  )
}
