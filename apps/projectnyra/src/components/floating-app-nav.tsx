"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  ExternalLink,
  GitBranch,
  Home,
  LayoutDashboard,
  PanelLeftClose,
  RadioTower,
  Settings,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/crm", label: "CRM", icon: LayoutDashboard },
  { href: "/nexus", label: "Nexus", icon: RadioTower },
  { href: "/memory", label: "Memory", icon: BrainCircuit },
  { href: "/assistant", label: "Assistant", icon: Bot },
  { href: "/campaigns", label: "Campaigns", icon: Workflow },
  { href: "/quotes", label: "Quotes", icon: CircleDollarSign },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];

const externalLinks = [
  {
    href:
      process.env.NEXT_PUBLIC_NEXUS_ROUTER_URL ??
      "https://nexus-router.projectnyra.com",
    label: "Router",
  },
  {
    href:
      process.env.NEXT_PUBLIC_TWENTY_URL ?? "https://twenty.projectnyra.com",
    label: "Twenty",
  },
];

export function FloatingAppNav() {
  const pathname = usePathname();
  const currentPath = pathname ?? "/";
  const [expanded, setExpanded] = useState(false);
  const [viewportFrame, setViewportFrame] = useState({
    bottom: 16,
    left: 0,
    width: "100vw",
  });

  useEffect(() => {
    const updateFrame = () => {
      const viewport = window.visualViewport;
      const visualHeight = viewport?.height ?? window.innerHeight;
      const visualWidth = viewport?.width ?? window.innerWidth;
      const visualTop = viewport?.offsetTop ?? 0;
      const visualLeft = viewport?.offsetLeft ?? 0;
      const layoutGap = window.innerHeight - visualHeight - visualTop;

      setViewportFrame({
        bottom: Math.max(16, layoutGap + 16),
        left: visualLeft,
        width: `${visualWidth}px`,
      });
    };

    updateFrame();
    window.visualViewport?.addEventListener("resize", updateFrame);
    window.visualViewport?.addEventListener("scroll", updateFrame);
    window.addEventListener("resize", updateFrame);

    return () => {
      window.visualViewport?.removeEventListener("resize", updateFrame);
      window.visualViewport?.removeEventListener("scroll", updateFrame);
      window.removeEventListener("resize", updateFrame);
    };
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-[100] flex px-3 print:hidden",
        expanded ? "justify-center" : "justify-end"
      )}
      style={viewportFrame}
    >
      <div
        className={cn(
          "pointer-events-auto overflow-hidden rounded-2xl border border-border/50 bg-background/88 shadow-2xl shadow-background/40 backdrop-blur-xl transition-all duration-300",
          expanded
            ? "w-full max-w-5xl translate-y-0 opacity-100"
            : "w-[9.5rem] max-w-[calc(100vw-1.5rem)]"
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border/35 px-3 py-2">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="flex min-w-0 items-center gap-2 rounded-xl px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:bg-muted/45 hover:text-foreground"
            aria-expanded={expanded}
            aria-controls="floating-app-nav-links"
          >
            <PanelLeftClose className="size-4 text-primary" />
            <span className="truncate">
              {expanded ? "Project Nyra Nav" : "Nav"}
            </span>
          </button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="size-8 p-0"
            onClick={() => setExpanded((value) => !value)}
            aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
          >
            {expanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronUp className="size-4" />
            )}
          </Button>
        </div>

        <div
          id="floating-app-nav-links"
          aria-hidden={!expanded}
          className={cn(
            "grid transition-[grid-template-rows] duration-300",
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <nav className="grid grid-cols-5 gap-1 px-2 py-2 lg:grid-cols-10">
              {primaryLinks.map(({ href, label, icon: Icon }) => {
                const active =
                  href === "/"
                    ? currentPath === href
                    : currentPath.startsWith(href);

                return (
                  <Link
                    key={href}
                    href={href}
                    title={label}
                    tabIndex={expanded ? undefined : -1}
                    className={cn(
                      "group flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2 text-center text-[9px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground sm:text-[10px]",
                      active &&
                        "bg-primary/12 text-primary ring-1 ring-primary/25"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 transition-transform group-hover:-translate-y-0.5",
                        active && "text-primary"
                      )}
                    />
                    <span className="max-w-full truncate leading-none">
                      {label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center justify-between gap-2 border-t border-border/35 px-3 py-2">
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Operator exits
              </span>
              <div className="flex gap-1">
                {externalLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    tabIndex={expanded ? undefined : -1}
                    className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                  >
                    {link.label}
                    <ExternalLink className="size-3" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
