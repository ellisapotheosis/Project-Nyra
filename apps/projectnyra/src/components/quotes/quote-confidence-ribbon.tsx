import { Calculator, ShieldAlert } from "lucide-react";

import { Badge } from "@nyra/ui";

export function QuoteConfidenceRibbon({
  source = "mock/fallback",
  className = "",
}: {
  source?: "mock/fallback" | "provider" | "live";
  className?: string;
}) {
  const tone =
    source === "live"
      ? "border-turquoise-500/30 bg-turquoise-500/10 text-turquoise-400"
      : source === "provider"
        ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400"
        : "border-amber-500/30 bg-amber-500/10 text-amber-300";

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border p-4 shadow-inner md:flex-row md:items-center md:justify-between ${tone} ${className}`}
    >
      <div className="flex items-start gap-3">
        <Calculator className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em]">
            Quote_Confidence_Ribbon
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase leading-relaxed tracking-widest opacity-80">
            Pricing source is labelled before broker approval. This is not a
            rate guarantee, lock, approval, or credit decision.
          </p>
        </div>
      </div>
      <Badge
        variant="outline"
        className="w-fit gap-2 border-current/30 bg-background/30 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-current"
      >
        <ShieldAlert className="size-3" />
        Source: {source}
      </Badge>
    </div>
  );
}
