"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Bell,
  Search,
  Command,
  ChevronDown,
  Check,
  Moon,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const themes = [
  {
    id: "midnight-mint",
    name: "Midnight Mint",
    description: "Blue shadows with mint accents",
    colors: ["oklch(0.5038 0.2937 285.3753)", "oklch(0.8871 0.1828 166.5465)"],
  },
  {
    id: "neon-violet",
    name: "Neon Violet",
    description: "Purple violet glow",
    colors: ["oklch(0.5038 0.2937 285.3753)", "oklch(0.5597 0.2956 301.9121)"],
  },
  {
    id: "cosmic-purple",
    name: "Cosmic Purple",
    description: "Deep purple with cyan",
    colors: ["oklch(0.3451 0.2089 279.9220)", "oklch(0.8653 0.1475 204.0171)"],
  },
  {
    id: "astral-indigo",
    name: "Astral Indigo",
    description: "Indigo with mint glow",
    colors: ["oklch(0.5038 0.2937 285.3753)", "oklch(0.8653 0.1475 204.0171)"],
  },
];

export function TopNav() {
  const { theme, setTheme } = useTheme();
  const [themeOpen, setThemeOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16",
        "border-b border-border/40",
        "bg-background/60 backdrop-blur-2xl backdrop-saturate-150",
        "transition-all duration-300"
      )}
      style={{ left: "280px" }} // Will be adjusted by parent
    >
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Left Section - Search */}
        <div className="flex items-center gap-4 flex-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-xl",
              "bg-muted/30 border border-border/40",
              "text-muted-foreground text-sm",
              "hover:border-primary/30 hover:bg-muted/50",
              "transition-all duration-300 min-w-[280px]",
              "hover:shadow-[0_0_20px_oklch(0.5038_0.2937_285.3753_/_0.15)]"
            )}
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Search systems...</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/50 border border-border/40">
              <Command className="w-3 h-3" />
              <span className="text-xs">K</span>
            </div>
          </motion.button>
        </div>

        {/* Center - System Time */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground tracking-widest">SYSTEM TIME</span>
            <motion.span
              key={time}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-mono font-bold text-foreground tracking-widest"
            >
              {time}
            </motion.span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "relative p-2.5 rounded-xl",
              "bg-muted/30 border border-border/40",
              "text-muted-foreground hover:text-foreground",
              "hover:border-primary/30",
              "transition-all duration-300",
              "hover:shadow-[0_0_15px_oklch(0.5038_0.2937_285.3753_/_0.2)]"
            )}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
          </motion.button>

          {/* Theme Switcher */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setThemeOpen(!themeOpen)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl",
                "bg-muted/30 border border-border/40",
                "hover:border-primary/30",
                "transition-all duration-300",
                themeOpen && "border-primary/50 shadow-[0_0_20px_oklch(0.5038_0.2937_285.3753_/_0.2)]"
              )}
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Palette className="w-4 h-4 text-primary" />
                  <div className="absolute inset-0 blur-sm bg-primary/30 -z-10" />
                </div>
                {mounted && (
                  <span className="text-sm font-medium text-foreground hidden sm:inline">
                    {currentTheme.name}
                  </span>
                )}
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform duration-300",
                  themeOpen && "rotate-180"
                )}
              />
            </motion.button>

            {/* Theme Dropdown */}
            <AnimatePresence>
              {themeOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setThemeOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    className={cn(
                      "absolute top-full right-0 mt-2 z-50 w-72",
                      "rounded-2xl p-2",
                      "bg-card/95 backdrop-blur-xl border border-border/60",
                      "shadow-2xl shadow-primary/10"
                    )}
                  >
                    <div className="px-3 py-2 mb-1">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold tracking-widest text-muted-foreground">
                          SELECT THEME
                        </span>
                      </div>
                    </div>
                    {themes.map((t) => (
                      <motion.button
                        key={t.id}
                        whileHover={{ x: 4 }}
                        onClick={() => {
                          setTheme(t.id);
                          setThemeOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-3 rounded-xl",
                          "transition-all duration-300",
                          theme === t.id
                            ? "bg-primary/15 border border-primary/30"
                            : "hover:bg-muted/50"
                        )}
                      >
                        {/* Color Preview */}
                        <div className="flex -space-x-1">
                          {t.colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-5 h-5 rounded-full border-2 border-background"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-foreground">
                            {t.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t.description}
                          </div>
                        </div>
                        {theme === t.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                          >
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Avatar */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "relative p-0.5 rounded-xl",
              "bg-gradient-to-br from-primary/50 to-accent/50",
              "hover:from-primary hover:to-accent",
              "transition-all duration-500"
            )}
          >
            <div className="w-9 h-9 rounded-[10px] bg-card flex items-center justify-center">
              <User className="w-4 h-4 text-foreground" />
            </div>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
