"use client";

import * as React from "react";
import { Bell, ChevronRight, Command, Home, Search, User } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@nyra/ui";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function CommandTopbar() {
  const pathname = usePathname() || "/";
  const paths = pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-white/5 bg-background/60 px-4 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden" />
        <div className="h-4 w-px bg-white/10 lg:hidden" />

        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="flex items-center gap-1 text-white/40 hover:text-white"
              >
                <Home className="size-3.5" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            {paths.map((path, index) => {
              const href = `/${paths.slice(0, index + 1).join("/")}`;
              const isLast = index === paths.length - 1;
              const label = path.charAt(0).toUpperCase() + path.slice(1);

              return (
                <React.Fragment key={href}>
                  <BreadcrumbSeparator className="text-white/20">
                    <ChevronRight className="size-3.5" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="font-semibold text-white">
                        {label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href={href}
                        className="text-white/40 hover:text-white"
                      >
                        {label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <div className="hidden items-center rounded-xl border border-white/5 bg-white/5 px-3 py-1.5 transition-all focus-within:bg-white/10 md:flex">
          <Search className="mr-2 size-4 text-white/40" />
          <input
            type="text"
            placeholder="Search command..."
            className="w-40 border-none bg-transparent text-xs text-white placeholder-white/20 outline-none focus:ring-0 lg:w-64"
          />
          <div className="ml-2 flex items-center gap-1 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/40">
            <Command className="size-2.5" />
            <span>K</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 lg:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-xl text-white/40 hover:bg-white/5 hover:text-white"
          >
            <Bell className="size-4.5" />
          </Button>
          <ThemeSwitcher />
          <div className="h-6 w-px bg-white/10 mx-1" />
          <Button
            variant="glass"
            size="sm"
            className="h-9 gap-2 rounded-xl px-3 border-white/10"
          >
            <div className="grid size-6 place-items-center rounded-full bg-primary/20 text-primary">
              <User className="size-3.5" />
            </div>
            <span className="hidden text-xs font-semibold text-white lg:inline-block">
              Ellis Andersen
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
