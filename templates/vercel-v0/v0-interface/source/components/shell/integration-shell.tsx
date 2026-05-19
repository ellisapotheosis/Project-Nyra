"use client";

import { ReactNode, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AuroraBackground } from "./aurora-background";
import { SidebarNav } from "./sidebar-nav";
import { TopNav } from "./top-nav";
import { PageTransition } from "./page-transition";
import { cn } from "@/lib/utils";

interface IntegrationShellProps {
  children: ReactNode;
}

export function IntegrationShell({ children }: IntegrationShellProps) {
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Listen for sidebar collapse
    const observer = new MutationObserver(() => {
      const sidebar = document.querySelector("aside");
      if (sidebar) {
        setSidebarWidth(sidebar.offsetWidth);
      }
    });

    const sidebar = document.querySelector("aside");
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ["style"] });
      setSidebarWidth(sidebar.offsetWidth);
    }

    return () => observer.disconnect();
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Aurora Background */}
      <AuroraBackground />

      {/* Scanline effect overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.015]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            oklch(0.8871 0.1828 166.5465 / 0.5) 2px,
            oklch(0.8871 0.1828 166.5465 / 0.5) 4px
          )`,
        }}
      />

      {/* Corner accents */}
      <div className="fixed top-0 left-0 w-32 h-32 pointer-events-none z-40">
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
          <path
            d="M0 0 L30 0 L30 3 L3 3 L3 30 L0 30 Z"
            fill="currentColor"
            className="text-primary"
          />
        </svg>
      </div>
      <div className="fixed top-0 right-0 w-32 h-32 pointer-events-none z-40 rotate-90">
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
          <path
            d="M0 0 L30 0 L30 3 L3 3 L3 30 L0 30 Z"
            fill="currentColor"
            className="text-primary"
          />
        </svg>
      </div>
      <div className="fixed bottom-0 left-0 w-32 h-32 pointer-events-none z-40 -rotate-90">
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
          <path
            d="M0 0 L30 0 L30 3 L3 3 L3 30 L0 30 Z"
            fill="currentColor"
            className="text-primary"
          />
        </svg>
      </div>
      <div className="fixed bottom-0 right-0 w-32 h-32 pointer-events-none z-40 rotate-180">
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
          <path
            d="M0 0 L30 0 L30 3 L3 3 L3 30 L0 30 Z"
            fill="currentColor"
            className="text-primary"
          />
        </svg>
      </div>

      {/* Sidebar Navigation */}
      <SidebarNav />

      {/* Top Navigation */}
      <motion.div
        animate={{ left: sidebarWidth }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-0 right-0 z-30 h-16"
        style={{ left: sidebarWidth }}
      >
        <TopNav />
      </motion.div>

      {/* Main Content Area */}
      <motion.main
        animate={{
          marginLeft: sidebarWidth,
          marginTop: 64, // Top nav height
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "relative min-h-[calc(100vh-64px)] p-6",
          "transition-all duration-300"
        )}
      >
        <PageTransition>
          <div className="relative z-10">{children}</div>
        </PageTransition>

        {/* Bottom status bar */}
        <div
          className={cn(
            "fixed bottom-0 right-0 h-8 z-30",
            "border-t border-border/40",
            "bg-background/60 backdrop-blur-xl",
            "flex items-center justify-between px-4",
            "text-[10px] tracking-widest text-muted-foreground"
          )}
          style={{ left: sidebarWidth }}
        >
          <div className="flex items-center gap-4">
            <span>NYRA INTEGRATION SHELL v2142.1.0</span>
            <span className="w-px h-3 bg-border" />
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              CONNECTED
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>LATENCY: 12ms</span>
            <span className="w-px h-3 bg-border" />
            <span>UPTIME: 99.97%</span>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
