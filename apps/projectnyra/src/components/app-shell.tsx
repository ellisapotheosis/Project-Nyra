"use client";

import { usePathname } from "next/navigation";

import { FloatingAppNav } from "@/components/floating-app-nav";
import { SiteHeader } from "@/components/site-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentPath = pathname ?? "/";
  const isAuthRoute = currentPath.startsWith("/auth");

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      <div className="pb-36">{children}</div>
      <FloatingAppNav />
    </>
  );
}
