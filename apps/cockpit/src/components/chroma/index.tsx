import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react"

import { cn } from "@/lib/utils"

type BorderMode = "brand" | "nyra" | "live" | "critical"

const modeClass: Record<BorderMode, string> = {
  brand: "chroma-border-brand",
  nyra: "chroma-border-nyra",
  live: "chroma-border-live",
  critical: "chroma-border-critical",
}

type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  mode?: BorderMode
  moving?: boolean
}

export function ReflectiveBorder({ className, mode = "brand", moving = false, ...props }: SurfaceProps) {
  return (
    <div
      className={cn("chroma-reflective-border", modeClass[mode], moving && "chroma-border-moving", className)}
      {...props}
    />
  )
}

export function MovingEdge({ className, mode = "brand", ...props }: SurfaceProps) {
  return <div className={cn("chroma-moving-edge", modeClass[mode], className)} {...props} />
}

export function ChromaFrame({ className, mode = "brand", moving = false, children, ...props }: SurfaceProps) {
  return (
    <ReflectiveBorder className={className} mode={mode} moving={moving} {...props}>
      <div className="chroma-surface">{children}</div>
    </ReflectiveBorder>
  )
}

export function ChromaCard({ className, mode = "brand", moving = false, children, ...props }: SurfaceProps) {
  return (
    <ChromaFrame className={cn("chroma-card", className)} mode={mode} moving={moving} {...props}>
      {children}
    </ChromaFrame>
  )
}

type ChromaButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  mode?: BorderMode
  active?: boolean
}

export function ChromaButton({ className, mode = "brand", active = false, children, ...props }: ChromaButtonProps) {
  return (
    <button className={cn("chroma-button", modeClass[mode], active && "chroma-button-active", className)} {...props}>
      {children}
    </button>
  )
}

export function ChromaInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("chroma-field", className)} {...props} />
}

export function ChromaTextarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("chroma-field min-h-28 resize-y", className)} {...props} />
}

export function ChromaSelect({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn("chroma-field", className)} {...props}>
      {children}
    </select>
  )
}

export function ChromaStatusPill({
  className,
  mode = "live",
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { mode?: BorderMode }) {
  return (
    <span className={cn("chroma-status-pill", modeClass[mode], className)} {...props}>
      {children}
    </span>
  )
}

export function ChromaTab({
  className,
  active = false,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button className={cn("chroma-tab", active && "chroma-tab-active", className)} {...props}>
      {children}
    </button>
  )
}

export function ChromaSidebarItem({
  className,
  active = false,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button className={cn("chroma-sidebar-item", active && "chroma-sidebar-item-active", className)} {...props}>
      {children}
    </button>
  )
}

export function ChromaMetricCard({
  label,
  value,
  detail,
  mode = "brand",
}: {
  label: string
  value: string
  detail: string
  mode?: BorderMode
}) {
  return (
    <ChromaCard mode={mode} className="p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-2 text-xs font-semibold leading-relaxed text-white/55">{detail}</p>
    </ChromaCard>
  )
}

export function ChromaAlertCard({
  title,
  detail,
  action,
  mode = "critical",
}: {
  title: string
  detail: string
  action: string
  mode?: BorderMode
}) {
  return (
    <ChromaCard mode={mode} moving className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <ChromaStatusPill mode={mode}>Action required</ChromaStatusPill>
          <h3 className="mt-4 text-lg font-black uppercase tracking-tight text-white">{title}</h3>
          <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-white/62">{detail}</p>
        </div>
        <ChromaButton mode={mode} active>
          {action}
        </ChromaButton>
      </div>
    </ChromaCard>
  )
}

export function ChromaModal({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="chroma-modal-backdrop">
      <ChromaFrame className={cn("chroma-modal", className)} mode="nyra" moving {...props}>
        {children}
      </ChromaFrame>
    </div>
  )
}

export function ChromaDialogShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <ChromaFrame mode="nyra" moving className="p-6">
      <h2 className="text-xl font-black uppercase tracking-tight text-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </ChromaFrame>
  )
}

export function NyraAuroraBackdrop({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("nyra-aurora-backdrop", className)} aria-hidden="true" {...props} />
}

export function NyraGridBackdrop({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("nyra-grid-backdrop", className)} aria-hidden="true" {...props} />
}

export function NyraGlowSurface({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("nyra-glow-surface", className)} {...props}>
      {children}
    </div>
  )
}
