import { cn } from "@/lib/utils";
import React from "react";

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = "rgba(255,255,255,0.22)",
      shimmerDuration = "2.6s",
      borderRadius = "9999px",
      background = "radial-gradient(ellipse 80% 50% at 50% 130%, #5038FF, #2a0a6a)",
      className,
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      style={
        {
          "--shimmer-color": shimmerColor,
          "--speed": shimmerDuration,
          "--radius": borderRadius,
          "--bg": background,
        } as React.CSSProperties
      }
      className={cn(
        "group relative z-0 flex cursor-pointer items-center justify-center gap-2 overflow-hidden",
        "border border-white/10 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)]",
        "transform-gpu transition-transform duration-200 ease-out active:scale-[0.97] hover:brightness-110",
        className
      )}
      {...props}
    >
      {/* shimmer sweep */}
      <div className="pointer-events-none absolute inset-0 overflow-visible blur-[3px] [container-type:size]">
        <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1]">
          <div
            className="absolute -inset-full rotate-0"
            style={{
              background: `conic-gradient(from 270deg, transparent 0deg, var(--shimmer-color) 50deg, transparent 50deg)`,
            }}
          />
        </div>
      </div>
      {/* inner gloss */}
      <div className="pointer-events-none absolute inset-px rounded-[calc(var(--radius)-1px)] bg-gradient-to-b from-white/10 to-transparent" />
      <span className="relative z-10 text-sm font-semibold tracking-wide">
        {children}
      </span>
    </button>
  )
);
ShimmerButton.displayName = "ShimmerButton";
