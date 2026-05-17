import Image from "next/image";
import Link from "next/link";
import { Settings, Bot } from "lucide-react";

import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "../theme/theme-switcher";

const links = [
  { href: "/", label: "Overview" },
  { href: "/assistant", label: "Assistant" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/leads", label: "Leads" },
  { href: "/quotes", label: "Quotes" },
  { href: "/fleet", label: "Fleet" },
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
            <div className="size-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-2xl border border-indigo-400/30">
              <Bot className="size-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter text-foreground uppercase italic leading-none">
                Project_Nyra
              </span>
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                Neural_Command_v1.0
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <Link
              href="/settings"
              className="inline-flex size-9 items-center justify-center rounded-full border border-border/60 bg-card/70 text-muted-foreground hover:text-foreground"
              aria-label="Open settings"
            >
              <Settings className="size-4" />
            </Link>
            <div className="flex items-center gap-2 border-l border-border/60 pl-4">
              <div className="flex flex-col items-end text-right mr-2 hidden sm:flex">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
                  Ellis_Andersen
                </span>
                <span className="text-[8px] font-bold uppercase text-indigo-400">
                  Master_Operator
                </span>
              </div>
              <div className="size-9 rounded-full border-2 border-indigo-500/50 bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-xs shadow-lg shadow-indigo-500/20">
                EA
              </div>
              <button className="ml-2 text-[9px] font-black uppercase tracking-tighter text-muted-foreground hover:text-foreground transition-colors">
                Sign_Out
              </button>
            </div>
          </div>
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
