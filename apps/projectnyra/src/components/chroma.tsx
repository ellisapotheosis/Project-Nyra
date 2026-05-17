import { cn } from "@/lib/utils";

type ChromaMode = "critical" | "brand" | "live";

const modeClasses: Record<ChromaMode, string> = {
  critical: "border-pink-500/30 bg-pink-500/10 text-pink-100",
  brand: "border-indigo-500/30 bg-indigo-500/10 text-indigo-100",
  live: "border-turquoise-500/30 bg-turquoise-500/10 text-turquoise-100",
};

export function NyraGlowSurface({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-[32px] border border-indigo-500/20 bg-card/40 shadow-[0_0_80px_rgba(99,102,241,0.12)]",
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
      <p className="text-[10px] font-black uppercase tracking-[0.24em]">
        {title}
      </p>
      <p className="mt-3 text-xs font-medium leading-relaxed opacity-75">
        {detail}
      </p>
      <button className="mt-5 text-[9px] font-black uppercase tracking-[0.3em] text-white">
        {action}
      </button>
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
      <p className="text-[9px] font-black uppercase tracking-[0.24em] opacity-70">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black tracking-tighter">{value}</p>
      <p className="mt-3 text-xs font-medium leading-relaxed opacity-70">
        {detail}
      </p>
    </div>
  );
}
