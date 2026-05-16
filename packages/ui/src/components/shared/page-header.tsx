import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type PageHeaderProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  description?: string
  actions?: ReactNode
  meta?: ReactNode
  className?: string
}

export function PageHeader({ eyebrow, title, subtitle, description, actions, meta, className }: PageHeaderProps) {
  const supportingCopy = description ?? subtitle

  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0 space-y-2">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>}
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        {supportingCopy && <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{supportingCopy}</p>}
        {meta && <div className="flex flex-wrap gap-2 pt-1">{meta}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
