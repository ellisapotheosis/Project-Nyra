"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface BrokerCursor {
  id: string;
  initials: string;
  color: string;
  x: number;
  y: number;
}

const COLORS = [
  "oklch(0.5038 0.2937 285.3753)",
  "oklch(0.667 0.295 322.15)",
  "oklch(0.8871 0.1828 166.5465)",
  "oklch(0.75 0.18 50)",
];

function colorForId(id: string) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return COLORS[hash % COLORS.length];
}

export function PresenceCursors({ roomId }: { roomId: string }) {
  const [cursors, setCursors] = useState<BrokerCursor[]>([]);
  const meId = useRef(`me-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    const NEXUS = process.env.NEXT_PUBLIC_NEXUS_ROUTER_URL ?? "";
    if (!NEXUS) return;

    function onMouseMove(e: MouseEvent) {
      const pct = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
      navigator.sendBeacon(
        `${NEXUS}/presence/${roomId}/move`,
        JSON.stringify({ id: meId.current, ...pct })
      );
    }
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [roomId]);

  useEffect(() => {
    const NEXUS = process.env.NEXT_PUBLIC_NEXUS_ROUTER_URL ?? "";
    if (!NEXUS) return;

    const es = new EventSource(`${NEXUS}/presence/${roomId}/stream`);
    es.onmessage = (e) => {
      try {
        const data: { id: string; initials: string; x: number; y: number } =
          JSON.parse(e.data);
        if (data.id === meId.current) return;
        setCursors((prev) => {
          const others = prev.filter((c) => c.id !== data.id);
          return [...others, { ...data, color: colorForId(data.id) }];
        });
      } catch {
        // ignore malformed
      }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [roomId]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[999]" aria-hidden>
      <AnimatePresence>
        {cursors.map((cursor) => (
          <motion.div
            key={cursor.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: 1,
              scale: 1,
              left: `${cursor.x * 100}%`,
              top: `${cursor.y * 100}%`,
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-lg"
              style={{ background: cursor.color }}
            >
              {cursor.initials}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
