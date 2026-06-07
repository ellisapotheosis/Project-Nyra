"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface CursorSpotlightProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  size?: number;
}

export function CursorSpotlight({
  children,
  className,
  color = "rgba(80,56,255,0.15)",
  size = 400,
}: CursorSpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -9999, y: -9999 });
  const [visible, setVisible] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setVisible(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative overflow-hidden", className)}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          pointerEvents: "none",
          borderRadius: "50%",
          width: size,
          height: size,
          transform: `translate(${position.x - size / 2}px, ${position.y - size / 2}px)`,
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.2s ease",
          zIndex: 0,
        }}
      />
      {children}
    </div>
  );
}
