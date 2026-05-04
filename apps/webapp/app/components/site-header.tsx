import Image from "next/image"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Overview" },
  { href: "/assistant", label: "Assistant" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/leads", label: "Leads" },
  { href: "/quotes", label: "Quotes" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/crm", label: "CRM" },
  { href: "/applications", label: "Applications" },
  { href: "/admin", label: "Admin" },
  { href: "/tools/openclaw", label: "OpenClaw" },
  { href: process.env.NEXT_PUBLIC_NEXUS_UI_URL ?? "https://nexus.ratehunter.net", label: "Nexus", external: true },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/88 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/branding/webapp/app-header.png"
              alt="RateHunter Nyra"
              width={220}
              height={48}
              className="h-auto w-full max-w-[220px]"
              priority
            />
            <span className="hidden text-sm text-muted-foreground xl:inline">
              Broker-facing workspace for campaigns, quotes, pipeline, and CRM views
            </span>
          </Link>
          <div className="rounded-full border border-border/60 bg-card/70 px-3 py-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            nyra.ratehunter.net
          </div>
        </div>
        <nav className="flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-full")}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
