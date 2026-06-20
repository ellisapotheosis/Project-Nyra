"use client";

import { motion } from "framer-motion";

type OrbStatus = "online" | "warning" | "error" | "idle";

const statusConfig: Record<OrbStatus, { color: string; label: string }> = {
  online: { color: "#10b981", label: "All systems operational" },
  warning: { color: "#f59e0b", label: "Degraded performance" },
  error: { color: "#ef4444", label: "System alert" },
  idle: { color: "#6366f1", label: "Standby mode" },
};

export function StatusOrb({ status = "online" }: { status?: OrbStatus }) {
  const { color, label } = statusConfig[status];

  return (
    <div className="flex items-center gap-2" title={label}>
      <div className="relative flex h-2.5 w-2.5">
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ backgroundColor: color }}
          animate={{ scale: [1, 1.8, 1], opacity: [0.75, 0, 0.75] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <span
          className="relative inline-flex rounded-full h-2.5 w-2.5"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest opacity-50" style={{ color }}>
        {label}
      </span>
    </div>
  );
}
