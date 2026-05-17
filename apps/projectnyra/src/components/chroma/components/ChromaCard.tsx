import { cn } from "@/lib/utils";

type BorderMode = "brand" | "nyra" | "live" | "critical";
const modeClass: Record<BorderMode, string> = {
  brand: "chroma-border-brand",
  nyra: "chroma-border-nyra",
  live: "chroma-border-live",
  critical: "chroma-border-critical",
};

export function ChromaCard({
  className,
  mode = "brand",
  moving = false,
  children,
  ...props
}: any) {
  return (
    <div
      className={cn(
        "chroma-reflective-border chroma-card",
        modeClass[mode as BorderMode],
        moving && "chroma-border-moving",
        className
      )}
      {...props}
    >
      <div className="chroma-surface">{children}</div>
    </div>
  );
}
