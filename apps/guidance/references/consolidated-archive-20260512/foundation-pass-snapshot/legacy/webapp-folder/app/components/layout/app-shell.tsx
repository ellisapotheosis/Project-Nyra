import Image from "next/image"
import Link from "next/link"
import { LockKeyhole, Menu, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { navGroups } from "./nav-model"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-foreground antialiased selection:bg-primary/30">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-5 py-5 lg:px-8">
          <div className="flex items-center justify-between gap-6">
            <Link href="/" className="flex min-w-0 items-center gap-4 group">
              <div className="size-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                <LockKeyhole className="size-5 text-white" />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">Project Nyra</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] leading-none">Broker_Ops_Cockpit</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Button className="h-10 px-6 rounded-lg bg-primary hover:bg-primary/80 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all active:scale-95">
                <LockKeyhole className="mr-2 size-3.5" />
                SUBSCRIBER_LOGIN
              </Button>
              <Link
                href="/settings"
                className="inline-flex size-10 items-center justify-center rounded-lg border border-border/50 bg-card/40 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shadow-xl"
                aria-label="Open settings"
              >
                <Settings className="size-4" />
              </Link>
            </div>
          </div>
          <details className="group rounded-lg border border-border/50 bg-card/40 p-2 shadow-lg lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground marker:hidden">
              <span className="flex items-center gap-2">
                <Menu className="size-4 text-primary" />
                Navigation
              </span>
              <span className="text-primary">Open</span>
            </summary>
            <nav className="mt-2 grid gap-2">
              {navGroups.map((group) => (
                <section key={group.label} className="rounded-lg border border-primary/10 bg-primary/5 p-2">
                  <p className="px-2 pb-2 text-[9px] font-black uppercase tracking-[0.25em] text-primary/70">{group.label}</p>
                  <div className="grid grid-cols-2 gap-1">
                    {group.items.map((item) => {
                      const external = "external" in item && item.external
                      const Icon = item.icon

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noreferrer" : undefined}
                          className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-primary hover:text-white"
                        >
                          <Icon className="size-3.5" />
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                </section>
              ))}
            </nav>
          </details>
          <nav className="hidden gap-4 overflow-x-auto pb-1 scrollbar-none lg:flex">
            {navGroups.map((group) => (
              <div key={group.label} className="flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/10 bg-primary/5 p-1.5 shadow-inner">
                <span className="px-3 text-[9px] font-black uppercase tracking-[0.25em] text-primary opacity-60">
                  {group.label}
                </span>
                <div className="flex items-center gap-1">
                  {group.items.map((item) => {
                    const external = "external" in item && item.external
                    const Icon = item.icon

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noreferrer" : undefined}
                        className="inline-flex h-8 items-center gap-2 rounded-lg px-3.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-sm"
                      >
                        <Icon className="size-3" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] px-5 py-10 lg:px-8">{children}</main>
    </div>
  )
}
