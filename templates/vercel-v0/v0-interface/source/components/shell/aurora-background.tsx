"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const getThemeColors = () => {
      const style = getComputedStyle(document.documentElement);
      const primary = style.getPropertyValue("--primary").trim();
      const accent = style.getPropertyValue("--accent").trim();
      const secondary = style.getPropertyValue("--secondary").trim();
      return { primary, accent, secondary };
    };

    const draw = () => {
      time += 0.002;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create multiple aurora layers
      for (let layer = 0; layer < 3; layer++) {
        const layerOffset = layer * 0.3;
        const alpha = 0.03 - layer * 0.008;

        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        for (let x = 0; x <= canvas.width; x += 5) {
          const y =
            canvas.height * 0.5 +
            Math.sin(x * 0.003 + time + layerOffset) * 150 +
            Math.sin(x * 0.007 + time * 1.3 + layerOffset) * 100 +
            Math.sin(x * 0.001 + time * 0.5 + layerOffset) * 200;

          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();

        // Use CSS variables for colors
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, `oklch(0.5038 0.2937 285.3753 / ${alpha})`);
        gradient.addColorStop(0.3, `oklch(0.3451 0.2089 279.9220 / ${alpha * 0.8})`);
        gradient.addColorStop(0.6, `oklch(0.8871 0.1828 166.5465 / ${alpha * 0.5})`);
        gradient.addColorStop(1, `oklch(0.5597 0.2956 301.9121 / ${alpha * 0.3})`);

        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Add floating particles
      for (let i = 0; i < 50; i++) {
        const x = (Math.sin(time * 0.5 + i * 0.5) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(time * 0.3 + i * 0.7) * 0.5 + 0.5) * canvas.height;
        const size = Math.sin(time + i) * 1.5 + 2;
        const alpha = Math.sin(time * 2 + i) * 0.3 + 0.4;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `oklch(0.8871 0.1828 166.5465 / ${alpha * 0.15})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{ opacity: 0.8 }}
      />
      {/* Grid overlay */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, oklch(0.8871 0.1828 166.5465 / 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, oklch(0.8871 0.1828 166.5465 / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Radial vignette */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, oklch(0.1448 0 0 / 0.8) 100%)`,
        }}
      />
    </>
  );
}
