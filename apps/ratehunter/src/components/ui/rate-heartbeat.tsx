// apps/ratehunter/src/components/ui/rate-heartbeat.tsx
"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface RateHeartbeatProps {
  currentRate?: number;
  weeklyAverage?: number;
  width?: number;
  height?: number;
  className?: string;
}

export function RateHeartbeat({
  currentRate = 6.625,
  weeklyAverage = 6.75,
  width = 320,
  height = 56,
  className,
}: RateHeartbeatProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ data: [] as number[], t: 0, raf: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const POINTS = 80;
    const isFavorable = currentRate <= weeklyAverage;
    const lineColor = isFavorable ? "#00CCB2" : "#F59E0B";

    stateRef.current.data = Array.from(
      { length: POINTS },
      (_, i) =>
        currentRate + Math.sin(i * 0.25) * 0.07 + Math.cos(i * 0.11) * 0.04
    );

    function draw() {
      const { data, t } = stateRef.current;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      const next =
        currentRate +
        Math.sin(t * 0.14) * 0.055 +
        Math.sin(t * 0.33) * 0.025 +
        Math.cos(t * 0.07) * 0.03;
      data.push(next);
      if (data.length > POINTS) data.shift();
      stateRef.current.t += 0.5;

      const min = Math.min(...data) - 0.04;
      const max = Math.max(...data) + 0.04;
      const range = max - min || 0.1;
      const W = canvas!.width;
      const H = canvas!.height;

      const toY = (v: number) => H - ((v - min) / range) * H * 0.82 - 4;

      const grad = ctx!.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, lineColor + "50");
      grad.addColorStop(1, lineColor + "00");
      ctx!.beginPath();
      data.forEach((v, i) => {
        const x = (i / (POINTS - 1)) * W;
        i === 0 ? ctx!.moveTo(x, toY(v)) : ctx!.lineTo(x, toY(v));
      });
      ctx!.lineTo(W, H);
      ctx!.lineTo(0, H);
      ctx!.closePath();
      ctx!.fillStyle = grad;
      ctx!.fill();

      ctx!.beginPath();
      ctx!.strokeStyle = lineColor;
      ctx!.lineWidth = 1.5;
      ctx!.shadowColor = lineColor;
      ctx!.shadowBlur = 8;
      data.forEach((v, i) => {
        const x = (i / (POINTS - 1)) * W;
        i === 0 ? ctx!.moveTo(x, toY(v)) : ctx!.lineTo(x, toY(v));
      });
      ctx!.stroke();
      ctx!.shadowBlur = 0;

      const lastX = W;
      const lastY = toY(data[data.length - 1]);
      ctx!.beginPath();
      ctx!.arc(lastX - 2, lastY, 3.5, 0, Math.PI * 2);
      ctx!.fillStyle = lineColor;
      ctx!.shadowColor = lineColor;
      ctx!.shadowBlur = 10;
      ctx!.fill();
      ctx!.shadowBlur = 0;

      stateRef.current.raf = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(stateRef.current.raf);
  }, [currentRate, weeklyAverage]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={cn("block", className)}
      aria-label={`Live rate feed: ${currentRate}% — ${currentRate <= weeklyAverage ? "below" : "above"} weekly average`}
    />
  );
}
