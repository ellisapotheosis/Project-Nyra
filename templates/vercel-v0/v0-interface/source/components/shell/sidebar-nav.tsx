"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Workflow,
  Router,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Database,
  Shield,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "CRM", href: "/crm", icon: Users, badge: "NEW" },
  { label: "n8n Workflows", href: "/n8n", icon: Workflow },
  { label: "Router Admin", href: "/router", icon: Router },
  { label: "Database", href: "/database", icon: Database },
  { label: "Security", href: "/security", icon: Shield },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function SidebarNav() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex flex-col",
        "border-r border-border/40",
        // Glassmorphism
        "bg-background/60 backdrop-blur-2xl backdrop-saturate-150",
        // Glow effect on the border
        "shadow-[inset_0_0_20px_oklch(0.5038_0.2937_285.3753_/_0.1)]"
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border/40">
        <motion.div
          whileHover={{ rotate: 180, scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md -z-10" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              <span className="text-sm font-bold tracking-widest text-foreground">
                NYRA
              </span>
              <span className="text-[10px] text-muted-foreground tracking-wider">
                INTEGRATION SHELL
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer",
                  "transition-all duration-300 group",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {/* Active indicator glow */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/30"
                    style={{
                      boxShadow: "0 0 20px oklch(0.5038 0.2937 285.3753 / 0.3)",
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                {/* Icon with glow on hover */}
                <div className="relative z-10">
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-all duration-300",
                      "group-hover:drop-shadow-[0_0_8px_oklch(0.8871_0.1828_166.5465_/_0.8)]"
                    )}
                  />
                </div>

                {/* Label */}
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="relative z-10 text-sm font-medium tracking-wide"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Badge */}
                {item.badge && !collapsed && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto relative z-10 px-2 py-0.5 text-[10px] font-bold rounded-full bg-accent text-accent-foreground"
                  >
                    {item.badge}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Status Section */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-4 mx-2 mb-4 rounded-xl bg-card/50 border border-border/40"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">System Status</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">All Systems Online</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-3 top-20 z-50",
          "w-6 h-6 rounded-full flex items-center justify-center",
          "bg-card border border-border/60 text-muted-foreground",
          "hover:text-foreground hover:border-primary/50",
          "transition-all duration-300",
          "hover:shadow-[0_0_15px_oklch(0.5038_0.2937_285.3753_/_0.4)]"
        )}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </motion.aside>
  );
}
