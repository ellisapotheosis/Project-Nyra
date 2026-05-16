'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GlowProps {
  className?: string;
  color?: string;
  size?: string;
  opacity?: number;
  position?: 'top' | 'bottom' | 'center' | 'top-right';
}

export function Glow({
  className,
  color = "indigo",
  size = "500px",
  opacity = 0.15,
  position = "center"
}: GlowProps) {
  const colorMap: any = {
    indigo: "rgba(99,102,241,1)",
    turquoise: "rgba(20,184,166,1)",
    pink: "rgba(244,63,94,1)"
  };

  const posClasses: any = {
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    top: "top-0 left-1/2 -translate-x-1/2",
    bottom: "bottom-0 left-1/2 -translate-x-1/2",
    "top-right": "top-0 right-0"
  };

  return (
    <div
      className={cn("absolute pointer-events-none -z-10 blur-[120px] rounded-full", posClasses[position], className)}
      style={{
        width: size,
        height: size,
        backgroundColor: colorMap[color] || color,
        opacity: opacity
      }}
    />
  );
}
