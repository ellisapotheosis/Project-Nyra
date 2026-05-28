"use client";

import * as React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NestedSidebar } from "./NestedSidebar";
import { CommandTopbar } from "./CommandTopbar";
import { TopHealthRail } from "./TopHealthRail";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <NestedSidebar />
        <div className="flex flex-1 flex-col overflow-hidden relative">
          <TopHealthRail />
          <CommandTopbar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 custom-scrollbar relative z-0">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-40">
              <div className="absolute -top-[10%] -left-[10%] size-[40%] rounded-full bg-primary/10 blur-[120px]" />
              <div className="absolute top-[20%] -right-[5%] size-[30%] rounded-full bg-accent/5 blur-[100px]" />
              <div className="absolute -bottom-[10%] left-[20%] size-[35%] rounded-full bg-brand-pink/5 blur-[110px]" />
            </div>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
