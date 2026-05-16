import Image from "next/image"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Portal Home" },
  { href: "/app", label: "Webapp" },
  { href: "/admin", label: "Admin" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/branding/landing/navbar-logo.png"
            alt="RateHunter"
            width={160}
            height={36}
            className="h-auto w-auto max-w-[160px]"
            priority
          />
          <span className="hidden text-sm text-muted-foreground md:inline">Webapp portal shell</span>
        </Link>
        <nav className="hidden gap-2 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
