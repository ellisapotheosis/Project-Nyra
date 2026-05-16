import Image from "next/image"
import Link from "next/link"

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/app/campaigns", label: "Campaign Ops" },
  { href: "/app/assistant", label: "Assistant" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,rgba(113,63,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(76,29,149,0.26),transparent_28%),linear-gradient(180deg,#09090b_0%,#111118_100%)] text-slate-50">
      <div className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="flex items-center gap-4">
            <Image
              src="/branding/admin/header-logo.png"
              alt="RateHunter admin"
              width={220}
              height={48}
              className="h-auto w-auto max-w-[220px]"
            />
            <p className="hidden text-sm text-slate-400 md:block">Operations, compliance, and quote oversight.</p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/25 hover:bg-white/5"
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
