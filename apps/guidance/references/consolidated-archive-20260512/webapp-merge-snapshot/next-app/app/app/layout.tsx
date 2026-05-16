import Image from "next/image"
import Link from "next/link"

const links = [
  { href: "/app", label: "Overview" },
  { href: "/app/assistant", label: "Assistant" },
  { href: "/app/campaigns", label: "Campaigns" },
  { href: "/app/tools/openclaw", label: "OpenClaw" },
]

export default function WebappLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-background to-muted/30">
      <div className="border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="flex items-center gap-4">
            <Image
              src="/branding/webapp/app-header.png"
              alt="RateHunter webapp"
              width={210}
              height={44}
              className="h-auto w-auto max-w-[210px]"
            />
            <p className="hidden text-sm text-muted-foreground md:block">
              Borrower and internal workflow tools consolidated into one app-router surface.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-border/60 px-4 py-2 text-sm font-medium transition hover:border-primary/50 hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">{children}</div>
    </div>
  )
}
