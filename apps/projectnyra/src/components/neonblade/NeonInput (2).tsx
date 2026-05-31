"use client";

/**
 * NEON INPUT — Neonblade Implementation
 * Inputs with animated glow border, corner-cut styling,
 * floating label, and optional icon prefix.
 *
 * Usage:
 *   <NeonInput
 *     label="Email Address"
 *     type="email"
 *     placeholder="you@domain.com"
 *     icon={Mail}
 *   />
 */

import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NeonInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  /** Color theme */
  color?: "primary" | "accent" | "pink";
}

const colorMap = {
  primary: {
    focus:  "focus:border-[oklch(0.52_0.30_270)] focus:shadow-[0_0_0_1px_oklch(0.52_0.30_270),0_0_12px_oklch(0.52_0.30_270/0.35),0_0_30px_oklch(0.52_0.30_270/0.2)]",
    label:  "group-focus-within/input:text-[oklch(0.78_0.20_195)]",
    icon:   "text-[oklch(0.52_0.30_270)]",
  },
  accent: {
    focus:  "focus:border-[oklch(0.78_0.20_195)] focus:shadow-[0_0_0_1px_oklch(0.78_0.20_195),0_0_12px_oklch(0.78_0.20_195/0.35),0_0_30px_oklch(0.78_0.20_195/0.2)]",
    label:  "group-focus-within/input:text-[oklch(0.78_0.20_195)]",
    icon:   "text-[oklch(0.78_0.20_195)]",
  },
  pink: {
    focus:  "focus:border-[oklch(0.65_0.32_330)] focus:shadow-[0_0_0_1px_oklch(0.65_0.32_330),0_0_12px_oklch(0.65_0.32_330/0.35),0_0_30px_oklch(0.65_0.32_330/0.2)]",
    label:  "group-focus-within/input:text-[oklch(0.65_0.32_330)]",
    icon:   "text-[oklch(0.65_0.32_330)]",
  },
};

export const NeonInput = forwardRef<HTMLInputElement, NeonInputProps>(
  (
    {
      label,
      icon: Icon,
      error,
      color = "primary",
      className,
      type = "text",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const c = colorMap[color];
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className="group/input flex flex-col gap-1.5">
        {label && (
          <label
            className={cn(
              "block font-mono text-[10px] uppercase tracking-[0.18em] text-[oklch(0.55_0.02_270)] transition-colors duration-200",
              c.label
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {/* Icon prefix */}
          {Icon && (
            <div
              className={cn(
                "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200",
                c.icon
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={cn(
              // Base
              "w-full bg-[oklch(0.08_0.02_270/0.8)] text-[oklch(0.96_0.01_270)]",
              "border border-[oklch(0.22_0.03_270/0.6)]",
              "rounded-sm",
              "py-3 pr-4 font-mono text-sm",
              "outline-none transition-all duration-250 ease-out",
              "placeholder:text-[oklch(0.35_0.015_270)] placeholder:font-mono",
              // Corner cut
              "[clip-path:polygon(8px_0%,100%_0%,100%_calc(100%-8px),calc(100%-8px)_100%,0%_100%,0%_8px)]",
              // Icon padding
              Icon ? "pl-10" : "pl-4",
              // Glow on focus
              c.focus,
              // Error state
              error &&
                "border-[oklch(0.60_0.28_25)] shadow-[0_0_0_1px_oklch(0.60_0.28_25),0_0_12px_oklch(0.60_0.28_25/0.3)]",
              className
            )}
            {...props}
          />

          {/* Password toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.40_0.02_270)] hover:text-[oklch(0.65_0.02_270)] transition-colors duration-150"
            >
              {showPassword ? (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="font-mono text-[10px] text-[oklch(0.70_0.26_25)] tracking-wide">
            {error}
          </p>
        )}
      </div>
    );
  }
);

NeonInput.displayName = "NeonInput";

/* ─────────────────────────────────────────────────────
   NEON TEXTAREA
───────────────────────────────────────────────────── */
interface NeonTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  color?: "primary" | "accent" | "pink";
}

export const NeonTextarea = forwardRef<HTMLTextAreaElement, NeonTextareaProps>(
  ({ label, error, color = "primary", className, ...props }, ref) => {
    const c = colorMap[color];

    return (
      <div className="group/input flex flex-col gap-1.5">
        {label && (
          <label
            className={cn(
              "block font-mono text-[10px] uppercase tracking-[0.18em] text-[oklch(0.55_0.02_270)] transition-colors duration-200",
              c.label
            )}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full min-h-[100px] resize-y bg-[oklch(0.08_0.02_270/0.8)] text-[oklch(0.96_0.01_270)]",
            "border border-[oklch(0.22_0.03_270/0.6)]",
            "rounded-sm px-4 py-3 font-mono text-sm",
            "outline-none transition-all duration-250 ease-out",
            "placeholder:text-[oklch(0.35_0.015_270)] placeholder:font-mono",
            "[clip-path:polygon(8px_0%,100%_0%,100%_calc(100%-8px),calc(100%-8px)_100%,0%_100%,0%_8px)]",
            c.focus,
            error &&
              "border-[oklch(0.60_0.28_25)] shadow-[0_0_0_1px_oklch(0.60_0.28_25)]",
            className
          )}
          {...props}
        />
        {error && (
          <p className="font-mono text-[10px] text-[oklch(0.70_0.26_25)] tracking-wide">
            {error}
          </p>
        )}
      </div>
    );
  }
);

NeonTextarea.displayName = "NeonTextarea";

/* ─────────────────────────────────────────────────────
   NEON SELECT
───────────────────────────────────────────────────── */
interface NeonSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  color?: "primary" | "accent" | "pink";
}

export function NeonSelect({
  label,
  error,
  options,
  color = "primary",
  className,
  ...props
}: NeonSelectProps) {
  const c = colorMap[color];

  return (
    <div className="group/input flex flex-col gap-1.5">
      {label && (
        <label
          className={cn(
            "block font-mono text-[10px] uppercase tracking-[0.18em] text-[oklch(0.55_0.02_270)] transition-colors duration-200",
            c.label
          )}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={cn(
            "w-full appearance-none bg-[oklch(0.08_0.02_270/0.8)] text-[oklch(0.96_0.01_270)]",
            "border border-[oklch(0.22_0.03_270/0.6)]",
            "rounded-sm pl-4 pr-10 py-3 font-mono text-sm",
            "outline-none transition-all duration-250 ease-out cursor-pointer",
            "[clip-path:polygon(8px_0%,100%_0%,100%_calc(100%-8px),calc(100%-8px)_100%,0%_100%,0%_8px)]",
            c.focus,
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[oklch(0.08_0.02_270)]">
              {opt.label}
            </option>
          ))}
        </select>
        {/* Arrow */}
        <div className={cn("pointer-events-none absolute right-3 top-1/2 -translate-y-1/2", c.icon)}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="font-mono text-[10px] text-[oklch(0.70_0.26_25)] tracking-wide">
          {error}
        </p>
      )}
    </div>
  );
}

