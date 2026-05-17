import * as React from "react";

import { cn } from "@/lib/utils";

type ChromaMode = "brand" | "critical" | "live";

const modeClasses: Record<ChromaMode, string> = {
  brand: "border-primary/30 bg-primary/10 text-primary",
  critical: "border-destructive/30 bg-destructive/10 text-destructive",
  live: "border-accent/30 bg-accent/10 text-accent-foreground",
};

export function NyraGlowSurface({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border/50 bg-card/50 shadow-2xl backdrop-blur",
        className
      )}
      {...props}
    />
  );
}

export function ChromaAlertCard({
  title,
  detail,
  action,
  mode = "brand",
}: {
  title: string;
  detail: string;
  action: string;
  mode?: ChromaMode;
}) {
  return (
    <div className={cn("rounded-2xl border p-5", modeClasses[mode])}>
      <p className="text-xs font-black uppercase tracking-widest">{title}</p>
      <p className="mt-3 text-sm text-foreground/75">{detail}</p>
      <p className="mt-5 text-[10px] font-black uppercase tracking-widest">
        {action}
      </p>
    </div>
  );
}

export function ChromaMetricCard({
  label,
  value,
  detail,
  mode = "brand",
}: {
  label: string;
  value: string;
  detail: string;
  mode?: ChromaMode;
}) {
  return (
    <div className={cn("rounded-2xl border p-5", modeClasses[mode])}>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-3 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
