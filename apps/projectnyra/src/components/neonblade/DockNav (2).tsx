"use client";

/**
 * DOCK NAV — Neonblade Implementation
 * macOS-style magnifying dock for ProjectNyra webapp bottom navigation.
 * Features spring physics magnification, tooltip labels, active indicator,
 * and dividers for grouping related actions.
 *
 * Usage (in webapp layout.tsx):
 *   <DockNav items={dockItems} />
 */

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface DockItem {
  icon: LucideIcon;
  label: string;
  href: string;
  /** Optional badge content (number or blinking dot) */
  badge?: number | "dot";
  /** Slot divider BEFORE this item */
  dividerBefore?: boolean;
}

interface DockNavProps {
  items: DockItem[];
  /** Maximum icon scale on hover */
  magnification?: number;
  /** Distance in px over which magnification spreads */
  distance?: number;
}

const BASE_SIZE = 44;       // px, normal icon area
const SPRING_CONFIG = { mass: 0.1, stiffness: 160, damping: 12 };

function DockIcon({
  item,
  mouseX,
  distance,
  magnification,
}: {
  item: DockItem;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  distance: number;
  magnification: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  // Compute distance from mouse to icon center
  const x = useMotionValue(0);

  const handleMouseOver = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    x.set(center);
  }, [x]);

  // Spring-based scale based on mouse proximity
  const scale = useSpring(
    useTransform(mouseX, (val) => {
      if (!ref.current) return 1;
      const rect = ref.current.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const dist = Math.abs(val - center);
      if (dist > distance) return 1;
      const normalized = 1 - dist / distance;
      return 1 + (magnification - 1) * normalized;
    }),
    SPRING_CONFIG
  );

  const Icon = item.icon;

  return (
    <>
      {item.dividerBefore && (
        <div className="mx-1 h-6 w-px bg-[oklch(0.22_0.03_270/0.6)] self-center" />
      )}
      <Link href={item.href} className="group relative">
        <motion.div
          ref={ref}
          onMouseOver={handleMouseOver}
          className={cn(
            "relative flex items-center justify-center rounded-full transition-colors duration-200",
            isActive
              ? "text-[oklch(0.78_0.20_195)] bg-[oklch(0.52_0.30_270/0.15)]"
              : "text-[oklch(0.55_0.02_270)] hover:text-[oklch(0.96_0.01_270)] hover:bg-[oklch(0.52_0.30_270/0.12)]"
          )}
          style={{
            width: BASE_SIZE,
            height: BASE_SIZE,
            scale,
          }}
        >
          <Icon
            className={cn(
              "transition-colors duration-200",
              isActive ? "size-5" : "size-5"
            )}
          />

          {/* Active indicator dot */}
          {isActive && (
            <span
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[oklch(0.78_0.20_195)]"
              style={{ boxShadow: "0 0 6px oklch(0.78 0.20 195)" }}
            />
          )}

          {/* Badge */}
          {item.badge && (
            <span
              className={cn(
                "absolute -top-0.5 -right-0.5 flex items-center justify-center",
                item.badge === "dot"
                  ? "h-2.5 w-2.5 rounded-full bg-[oklch(0.65_0.32_330)] animate-pulse"
                  : "h-4 min-w-4 rounded-full bg-[oklch(0.65_0.32_330)] px-1 text-[9px] font-bold text-white"
              )}
            >
              {item.badge !== "dot" && item.badge > 9 ? "9+" : item.badge !== "dot" ? item.badge : null}
            </span>
          )}
        </motion.div>

        {/* Tooltip */}
        <div
          className={cn(
            "pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2",
            "whitespace-nowrap rounded bg-[oklch(0.09_0.02_270)] border border-[oklch(0.22_0.03_270/0.6)]",
            "px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[oklch(0.78_0.18_270)]",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
            "shadow-[0_4px_12px_oklch(0_0_0/0.4)]"
          )}
        >
          {item.label}
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[oklch(0.22_0.03_270/0.6)]" />
        </div>
      </Link>
    </>
  );
}

export function DockNav({
  items,
  magnification = 1.5,
  distance = 100,
}: DockNavProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <nav
      className={cn(
        "fixed bottom-5 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-0.5 px-3 py-2",
        "rounded-full",
        "bg-[oklch(0.08_0.025_270/0.85)] backdrop-blur-2xl",
        "border border-[oklch(0.30_0.05_270/0.5)]",
        "shadow-[0_8px_32px_oklch(0_0_0/0.5),0_0_0_1px_oklch(0.52_0.30_270/0.1),inset_0_1px_0_oklch(1_0_0/0.05)]"
      )}
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
    >
      {items.map((item) => (
        <DockIcon
          key={item.href}
          item={item}
          mouseX={mouseX}
          distance={distance}
          magnification={magnification}
        />
      ))}
    </nav>
  );
}

/* ─────────────────────────────────────────────────────
   PRESET DOCK CONFIG for ProjectNyra Webapp
───────────────────────────────────────────────────── */
import {
  LayoutDashboard,
  Users,
  Megaphone,
  CircleDollarSign,
  GitMerge,
  MessageSquare,
  Bot,
  Settings,
  Brain,
  Activity,
  Zap,
} from "lucide-react";

export const nyraWebappDockItems: DockItem[] = [
  { icon: LayoutDashboard, label: "Overview",   href: "/" },
  { icon: Users,           label: "Leads",      href: "/leads", badge: "dot" },
  { icon: Megaphone,       label: "Campaigns",  href: "/campaigns" },
  { icon: CircleDollarSign, label: "Quotes",    href: "/quotes", badge: 3 },
  { icon: GitMerge,        label: "Pipeline",   href: "/pipeline" },
  // Divider
  { icon: MessageSquare,   label: "Assistant",  href: "/assistant", dividerBefore: true },
  { icon: Bot,             label: "OpenClaw",   href: "/tools/openclaw", badge: "dot" },
  { icon: Brain,           label: "Memory",     href: "/memory" },
  // Divider
  { icon: Activity,        label: "Agents",     href: "/agents", dividerBefore: true },
  { icon: Zap,             label: "Integrations", href: "/integrations" },
  { icon: Settings,        label: "Settings",   href: "/settings" },
];

