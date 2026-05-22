import Link from "next/link";
import { ExternalLink, Landmark, Settings } from "lucide-react";

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
  { href: "/applications", label: "Applications" },
  { href: "/settings", label: "Settings" },
  { href: "/tools/openclaw", label: "OpenClaw" },
  {
    href:
      process.env.NEXT_PUBLIC_NEXUS_UI_URL ?? "https://nexus.projectnyra.com",
    label: "Nexus",
    external: true,
  },
  {
    href:
      process.env.NEXT_PUBLIC_TWENTY_URL ?? "https://twenty.projectnyra.com",
    label: "Twenty",
    external: true,
  },
];

export function SiteHeader() {
  return (
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
    </header>
  );
}
