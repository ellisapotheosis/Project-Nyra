// apps/ratehunter/src/components/RateParticleCloud.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { LenderRate } from "@/hooks/useRates";

interface Particle {
  lender: LenderRate;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  selected: boolean;
}

interface RateParticleCloudProps {
  rates: LenderRate[];
  className?: string;
  onSelect?: (lender: LenderRate) => void;
}

export function RateParticleCloud({
  rates,
  className,
  onSelect,
}: RateParticleCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const [selected, setSelected] = useState<LenderRate | null>(null);

  const buildParticles = useCallback(
    (w: number, h: number) => {
      const minRate = Math.min(...rates.map((r) => r.rate));
      const maxRate = Math.max(...rates.map((r) => r.rate));
      const span = maxRate - minRate || 0.5;

      particlesRef.current = rates.map((lender, i) => {
        const pct = (lender.rate - minRate) / span;
        const targetX = 55 + pct * (w - 110);
        const targetY = h / 2 + Math.sin(i * 1.05 + 0.4) * (h * 0.22);
        const color =
          pct < 0.34
            ? "oklch(0.8871 0.1828 166.5465)"
            : pct < 0.67
              ? "oklch(0.5038 0.2937 285.3753)"
              : "oklch(0.667 0.295 322.15)";
        return {
          lender,
          x: Math.random() * w,
          y: Math.random() * h,
          targetX,
          targetY,
          radius: 22 - pct * 8,
          color,
          vx: 0,
          vy: 0,
          selected: false,
        };
      });
    },
    [rates]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    buildParticles(W, H);

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      for (const p of particlesRef.current) {
        p.vx = p.vx * 0.82 + (p.targetX - p.x) * 0.07;
        p.vy = p.vy * 0.82 + (p.targetY - p.y) * 0.07;
        p.x += p.vx;
        p.y += p.vy;

        const glowAlpha = p.selected ? "55" : "30";
        const hexColor = p.color.includes("0.8871")
          ? `#00ccb2${glowAlpha}`
          : p.color.includes("0.5038")
            ? `#5038ff${glowAlpha}`
            : `#f20d7a${glowAlpha}`;
        const hexSolid = p.color.includes("0.8871")
          ? "#00ccb2"
          : p.color.includes("0.5038")
            ? "#5038ff"
            : "#f20d7a";

        const glow = ctx!.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.radius + 12
        );
        glow.addColorStop(0, hexColor);
        glow.addColorStop(1, "transparent");
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius + 12, 0, Math.PI * 2);
        ctx!.fillStyle = glow;
        ctx!.fill();

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = p.selected ? hexSolid + "40" : hexSolid + "18";
        ctx!.strokeStyle = hexSolid;
        ctx!.lineWidth = p.selected ? 2 : 1.2;
        if (p.selected) {
          ctx!.shadowColor = hexSolid;
          ctx!.shadowBlur = 12;
        }
        ctx!.fill();
        ctx!.stroke();
        ctx!.shadowBlur = 0;

        ctx!.fillStyle = p.selected ? "#ffffff" : "#e2e8f0";
        ctx!.font = `${p.selected ? "bold " : ""}${Math.round(p.radius * 0.52)}px ui-sans-serif,system-ui,sans-serif`;
        ctx!.textAlign = "center";
        ctx!.textBaseline = "middle";
        ctx!.fillText(`${p.lender.rate.toFixed(3)}%`, p.x, p.y);
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [rates, buildParticles]);

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    let hit: Particle | null = null;
    for (const p of particlesRef.current) {
      if (Math.hypot(p.x - mx, p.y - my) <= p.radius + 4) {
        hit = p;
        break;
      }
    }

    particlesRef.current.forEach((p) => {
      p.selected = false;
    });
    if (hit) {
      hit.selected = true;
      setSelected(hit.lender);
      onSelect?.(hit.lender);
    } else {
      setSelected(null);
    }
  }

  return (
    <div className={className} style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        width={640}
        height={180}
        onClick={handleClick}
        style={{
          width: "100%",
          height: "auto",
          cursor: "pointer",
          display: "block",
        }}
        aria-label="Interactive rate comparison. Click a bubble to select a lender."
        role="application"
      />
      {selected && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(4,4,14,0.92)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(0,204,178,0.3)",
            borderRadius: 10,
            padding: "8px 18px",
            fontSize: 12,
            color: "white",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          <strong style={{ color: "#00ccb2" }}>{selected.name}</strong>
          {" · "}
          {selected.rate.toFixed(3)}% · ${selected.monthly.toLocaleString()}/mo
          · {selected.loanType}
        </div>
      )}
    </div>
  );
}
