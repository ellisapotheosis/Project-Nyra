"use client";

import { useEffect, useId } from "react";
import { cn } from "@/lib/utils";

interface OrbitingCirclesProps {
  children: React.ReactNode;
  items: React.ReactNode[];
  radius?: number;
  duration?: number;
  className?: string;
}

export function OrbitingCircles({
  children,
  items,
  radius = 90,
  duration = 20,
  className,
}: OrbitingCirclesProps) {
  const uid = useId().replace(/:/g, "");
  const containerSize = radius * 2 + 80;

  useEffect(() => {
    const styleId = `orbiting-${uid}`;
    if (document.getElementById(styleId)) return;

    const keyframes = items
      .map((_, i) => {
        const startDeg = (360 / items.length) * i;
        const endDeg = startDeg + 360;
        return `
          @keyframes orbit-${uid}-${i} {
            from { transform: rotate(${startDeg}deg) translateX(${radius}px) rotate(-${startDeg}deg); }
            to   { transform: rotate(${endDeg}deg)   translateX(${radius}px) rotate(-${endDeg}deg);   }
          }
        `;
      })
      .join("\n");

    const tag = document.createElement("style");
    tag.id = styleId;
    tag.textContent = keyframes;
    document.head.appendChild(tag);

    return () => {
      document.getElementById(styleId)?.remove();
    };
  }, [uid, items, radius]);

  return (
    <div
      className={cn("relative", className)}
      style={{ width: containerSize, height: containerSize }}
    >
      {/* center element */}
      <div
        className="absolute top-1/2 left-1/2"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        {children}
      </div>

      {/* orbit ring */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 rounded-full border border-white/10"
        style={{
          width: radius * 2,
          height: radius * 2,
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* orbiting items */}
      {items.map((item, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2"
          style={{
            animation: `orbit-${uid}-${i} ${duration}s linear infinite`,
            transformOrigin: "0 0",
          }}
        >
          <div style={{ transform: "translate(-50%, -50%)" }}>{item}</div>
        </div>
      ))}
    </div>
  );
}
