import { ChromaCard } from "./ChromaCard";

export function ChromaMetricCard({
  label,
  value,
  detail,
  mode = "brand",
}: {
  label: string;
  value: string;
  detail: string;
  mode?: "brand" | "nyra" | "live" | "critical";
}) {
  return (
    <ChromaCard mode={mode} className="p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black tracking-tight text-white">
        {value}
      </p>
      <p className="mt-2 text-xs font-semibold leading-relaxed text-white/55">
        {detail}
      </p>
    </ChromaCard>
  );
}
