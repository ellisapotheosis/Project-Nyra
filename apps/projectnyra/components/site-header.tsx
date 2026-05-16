import Link from "next/link";
import { Landmark, Settings } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Overview" },
  { href: "/assistant", label: "Assistant" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/leads", label: "Leads" },
  { href: "/quotes", label: "Quotes" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/crm", label: "CRM" },
  { href: "/applications", label: "Applications" },
  { href: "/settings", label: "Settings" },
  { href: "/tools/openclaw", label: "OpenClaw" },
  {
    href:
      process.env.NEXT_PUBLIC_NEXUS_UI_URL ?? "https://nexus.projectnyra.com",
    label: "Nexus",
    external: true,
  },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/88 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-xl border border-border/70 bg-card text-primary shadow-sm">
              <Landmark className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              RateHunter Nyra
            </span>
            <span className="hidden text-sm text-muted-foreground xl:inline">
              Broker-facing workspace for campaigns, quotes, pipeline, and CRM
              views
            </span>
          </Link>
          <Link
            href="/settings"
            className="inline-flex size-9 items-center justify-center rounded-full border border-border/60 bg-card/70 text-muted-foreground hover:text-foreground"
            aria-label="Open settings"
          >
            <Settings className="size-4" />
          </Link>
        </div>
        <nav className="flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "rounded-full"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
