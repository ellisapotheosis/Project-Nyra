"use client";

import { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotColor?: string;
}

export function SpotlightCard({
  children,
  className,
  spotColor = "rgba(80,56,255,0.12)",
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current?.style.setProperty("--x", `${x}%`);
    cardRef.current?.style.setProperty("--y", `${y}%`);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={cn("relative overflow-hidden", className)}
    >
      {/* spotlight overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle 300px at var(--x, 50%) var(--y, 50%), ${spotColor}, transparent)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
