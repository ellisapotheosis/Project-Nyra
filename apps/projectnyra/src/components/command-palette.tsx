"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Leads", href: "/leads" },
  { label: "Pipeline", href: "/pipeline" },
  { label: "Campaigns", href: "/campaigns" },
  { label: "Quotes", href: "/quotes" },
  { label: "Applications", href: "/applications" },
  { label: "CRM", href: "/crm" },
  { label: "Settings", href: "/settings" },
  { label: "AI Assistant", href: "/assistant" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSelect(href: string) {
    setOpen(false);
    router.push(href);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[oklch(0.3098_0.0753_286.4544)] bg-[oklch(0.1569_0.0191_294.2843)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <div className="flex items-center border-b border-[oklch(0.3098_0.0753_286.4544)] px-4">
            <Command.Input
              placeholder="Search broker commands..."
              className="h-12 w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
              autoFocus
            />
            <kbd className="ml-2 shrink-0 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/30">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-white/30">
              No results found.
            </Command.Empty>

            <Command.Group
              heading="Navigation"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-white/25"
            >
              {navItems.map((item) => (
                <Command.Item
                  key={item.href}
                  value={item.label}
                  onSelect={() => handleSelect(item.href)}
                  className="flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white aria-selected:bg-white/8 aria-selected:text-white"
                >
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
