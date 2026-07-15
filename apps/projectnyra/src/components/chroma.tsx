"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NyraGlowSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function NyraGlowSurface({
  children,
  className,
  ...props
}: NyraGlowSurfaceProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-zinc-900/60 bg-zinc-950/45 p-6 backdrop-blur-xl shadow-2xl",
        "before:absolute before:inset-0 before:-translate-y-1/2 before:translate-x-1/2 before:rounded-full before:bg-gradient-to-tr before:from-teal-500/10 before:to-indigo-500/10 before:blur-3xl before:content-['']",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface ChromaAlertCardProps {
  title: string;
  detail: string;
  action?: string;
  mode?: "critical" | "warning" | "info";
  className?: string;
}

export function ChromaAlertCard({
  title,
  detail,
  action,
  mode = "info",
  className,
}: ChromaAlertCardProps) {
  const modeStyles = {
    critical:
      "border-pink-500/30 bg-pink-500/5 text-pink-400 before:bg-pink-500/15",
    warning:
      "border-amber-500/30 bg-amber-500/5 text-amber-400 before:bg-amber-500/15",
    info: "border-indigo-500/30 bg-indigo-500/5 text-indigo-400 before:bg-indigo-500/15",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 transition-all hover:scale-[1.01] hover:shadow-lg",
        modeStyles[mode],
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-zinc-900/65 p-2">
          {mode === "critical" ? (
            <AlertTriangle className="size-4 text-pink-400 animate-pulse" />
          ) : (
            <ShieldCheck className="size-4 text-indigo-400" />
          )}
        </div>
        <div className="space-y-1.5 flex-1">
          <h4 className="font-semibold text-sm tracking-tight text-zinc-100">
            {title}
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
            {detail}
          </p>
          {action && (
            <button className="inline-flex items-center gap-1 text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors pt-1">
              {action}
              <ArrowRight className="size-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface ChromaMetricCardProps {
  label: string;
  value: string | number;
  detail?: string;
  mode?: "brand" | "teal" | "live" | "zinc";
  className?: string;
}

export function ChromaMetricCard({
  label,
  value,
  detail,
  mode = "zinc",
  className,
}: ChromaMetricCardProps) {
  const modeGradients = {
    brand:
      "from-indigo-500/10 to-purple-500/5 border-indigo-500/20 text-indigo-400",
    teal: "from-teal-500/10 to-emerald-500/5 border-teal-500/20 text-teal-400",
    live: "from-emerald-500/10 to-teal-500/5 border-emerald-500/20 text-emerald-400 animate-pulse",
    zinc: "from-zinc-900/50 to-zinc-950/50 border-zinc-800/80 text-zinc-400",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border bg-gradient-to-br p-5 flex flex-col justify-between transition-all hover:scale-[1.01]",
        modeGradients[mode],
        className
      )}
    >
      <div className="space-y-2">
        <span className="text-xs text-zinc-400 font-medium tracking-wide uppercase">
          {label}
        </span>
        <div className="text-2xl font-semibold text-zinc-100 tracking-tight">
          {value}
        </div>
      </div>
      {detail && (
        <p className="text-[11px] text-zinc-500 leading-normal mt-3 pt-3 border-t border-zinc-900/50">
          {detail}
        </p>
      )}
    </div>
  );
}
