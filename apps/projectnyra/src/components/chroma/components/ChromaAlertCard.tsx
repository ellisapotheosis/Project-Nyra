import { ChromaCard } from "./ChromaCard";
import { cn } from "@/lib/utils";

export function ChromaAlertCard({
  title,
  detail,
  action,
  mode = "critical",
}: {
  title: string;
  detail: string;
  action: string;
  mode?: "brand" | "nyra" | "live" | "critical";
}) {
  return (
    <ChromaCard mode={mode} moving className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="chroma-status-pill">Action required</span>
          <h3 className="mt-4 text-lg font-black uppercase tracking-tight text-white">
            {title}
          </h3>
          <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-white/62">
            {detail}
          </p>
        </div>
        <button className="chroma-button chroma-button-active">{action}</button>
      </div>
    </ChromaCard>
  );
}
