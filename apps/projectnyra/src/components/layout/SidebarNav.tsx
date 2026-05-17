"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useRole, canAccessRoute } from "@/lib/rbac";
import { navGroups } from "./nav-model";

export function SidebarNav() {
  const pathname = usePathname();
  const role = useRole();

  return (
    <nav className="flex flex-col gap-8 py-8">
      {navGroups.map((group) => {
        // Filter items by section and access permissions
        const sectionItems = group.items.filter(
          (item) => !role || canAccessRoute(role, item.href)
        );

        if (sectionItems.length === 0) return null;

        return (
          <div key={group.id} className="space-y-3 px-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400 opacity-60">
              {group.label}
            </h3>

            <div className="space-y-1">
              {sectionItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-tight transition-all border",
                      isActive
                        ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/30 shadow-inner"
                        : "text-muted-foreground hover:text-foreground hover:bg-indigo-500/5 border-transparent"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center transition-colors",
                        isActive ? "text-indigo-400" : "text-muted-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
