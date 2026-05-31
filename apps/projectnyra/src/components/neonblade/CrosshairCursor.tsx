"use client";

/**
 * CROSSHAIR CURSOR — Neonblade Implementation
 * Drop inside any section to enable a custom crosshair cursor overlay.
 * Uses canvas for the animated reticle that follows mouse position.
 *
 * Usage:
 *   <section className="relative crosshair-zone">
 *     <CrosshairCursor color="var(--primary)" />
 *     ... your content ...
 *   </section>
 */

import { useEffect, useRef, useState } from "react";

interface CrosshairCursorProps {
  /** CSS color string or variable reference */
  color?: string;
  /** Outer ring radius in px */
  outerRadius?: number;
  /** Inner dot radius in px */
  innerRadius?: number;
  /** Gap between crosshair lines and ring */
  lineGap?: number;
  /** Crosshair arm length */
  lineLength?: number;
}

export function CrosshairCursor({
  color = "oklch(0.52 0.30 270)",
  outerRadius = 20,
  innerRadius = 3,
  lineGap = 6,
  lineLength = 14,
}: CrosshairCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -200, y: -200 });
  const targetRef = useRef({ x: -200, y: -200 });
  const rafRef = useRef<number>(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setVisible(true);
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mouseenter", handleMouseEnter);

    // Resolve CSS color variable
    const resolvedColor = color.startsWith("oklch")
      ? color
      : getComputedStyle(document.documentElement).getPropertyValue(
          color.replace("var(", "").replace(")", "").trim()
        ) || "#6366f1";

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Smooth follow with lerp
      posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.12;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.12;

      const { x, y } = posRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!visible) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.save();
      ctx.strokeStyle = resolvedColor;
      ctx.fillStyle = resolvedColor;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = resolvedColor;
      ctx.shadowBlur = 8;
      ctx.globalAlpha = 0.9;

      // Outer ring
      ctx.beginPath();
      ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(x, y, innerRadius, 0, Math.PI * 2);
      ctx.fill();

      // Crosshair arms
      const arms = [
        [x, y - outerRadius - lineGap, x, y - outerRadius - lineGap - lineLength],
        [x, y + outerRadius + lineGap, x, y + outerRadius + lineGap + lineLength],
        [x - outerRadius - lineGap, y, x - outerRadius - lineGap - lineLength, y],
        [x + outerRadius + lineGap, y, x + outerRadius + lineGap + lineLength, y],
      ];

      arms.forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // Corner ticks at ring
      const corners = [
        [Math.PI * 0.25, Math.PI * 0.35],
        [Math.PI * 0.65, Math.PI * 0.75],
        [Math.PI * 1.25, Math.PI * 1.35],
        [Math.PI * 1.65, Math.PI * 1.75],
      ];

      corners.forEach(([start, end]) => {
        ctx.beginPath();
        ctx.arc(x, y, outerRadius, start, end);
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.lineWidth = 1.5;
      });

      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    });
    resizeObserver.observe(container);

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
    };
  }, [color, outerRadius, innerRadius, lineGap, lineLength, visible]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 crosshair-zone"
      style={{ zIndex: 0 }}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
        style={{ zIndex: 1 }}
      />
    </div>
  );
}
