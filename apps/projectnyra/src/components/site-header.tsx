"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Bot, ExternalLink, Landmark, Settings } from "lucide-react";

import { AiSidebar } from "@/components/ai-sidebar";
import { CommandPalette } from "@/components/command-palette";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/admin", label: "Admin" },
  { href: "/assistant", label: "Assistant" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/campaigns/builder", label: "Builder" },
  { href: "/leads", label: "Leads" },
  { href: "/quotes", label: "Quotes" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/crm", label: "CRM" },
  { href: "/nexus", label: "Nexus" },
  { href: "/applications", label: "Applications" },
  { href: "/settings", label: "Settings" },
  { href: "/tools/openclaw", label: "OpenClaw" },
  {
    href:
      process.env.NEXT_PUBLIC_NEXUS_ROUTER_URL ??
      "https://nexus-router.projectnyra.com",
    label: "Router",
    external: true,
  },
  {
    href:
      process.env.NEXT_PUBLIC_TWENTY_URL ?? "https://twenty.projectnyra.com",
    label: "Twenty",
    external: true,
  },
];

function NotificationBell({ count = 0 }: { count?: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
      >
        <Bell className="size-4 text-white/70" />
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[oklch(0.667_0.295_322.15)] text-[9px] font-bold text-white"
            >
              {count > 9 ? "9+" : count}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* click-away */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-10 z-50 w-72 rounded-2xl border border-white/10 bg-[oklch(0.1569_0.0191_294.2843)] p-3 shadow-xl"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">
                Notifications
              </p>
              {count === 0 ? (
                <p className="text-sm text-white/50 py-2">
                  No new notifications
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="rounded-xl bg-white/5 p-2.5">
                    <p className="text-xs font-medium text-white">
                      New lead: John S.
                    </p>
                    <p className="text-[10px] text-white/50">
                      Purchase · $485K · 2m ago
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-2.5">
                    <p className="text-xs font-medium text-white">
                      Quote approved
                    </p>
                    <p className="text-[10px] text-white/50">
                      FHA 30yr @ 6.5% · 15m ago
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SiteHeader() {
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "N") {
        e.preventDefault();
        setAiSidebarOpen((o) => !o);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <CommandPalette />
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="inline-flex size-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary shadow-[0_0_15px_-3px_rgba(var(--primary-rgb),0.2)]">
                <Landmark className="size-4.5" />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="font-bold tracking-tight text-foreground">
                  NYRA
                </span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/80">
                  OPERATIONS
                </span>
              </div>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {links.slice(0, 7).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1 xl:flex">
              {links.slice(7).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer" : undefined}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "h-8 gap-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-foreground"
                  )}
                >
                  <span>{link.label}</span>
                  {link.external && (
                    <ExternalLink className="size-3 opacity-50" />
                  )}
                </Link>
              ))}
            </div>
            <div className="h-4 w-px bg-border/40" />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAiSidebarOpen(true)}
                title="Ask Nyra (⌘⇧N)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Bot size={14} />
                <span className="hidden sm:inline">Ask Nyra</span>
              </button>
              <NotificationBell count={3} />
              <ThemeSwitcher />
              <Link
                href="/settings"
                className="inline-flex size-8 items-center justify-center rounded-lg border border-border/40 bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                <Settings className="size-4" />
              </Link>
            </div>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto border-t border-border/30 px-4 py-2 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 shrink-0 px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <AiSidebar
        isOpen={aiSidebarOpen}
        onClose={() => setAiSidebarOpen(false)}
      />
    </>
  );
}
