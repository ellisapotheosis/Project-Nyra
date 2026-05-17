"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarNav } from "./SidebarNav";
import { TopStatusBar } from "./TopStatusBar";
import { CommandPalette } from "@nyra/ui";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Initializing Neural Command Deck...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      {/* Top Status Bar */}
      <TopStatusBar />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 overflow-y-auto border-r border-purple-500/20 bg-black/40 backdrop-blur hidden lg:block">
          <div className="px-2 py-4">
            {/* Logo Area */}
            <div className="mb-8 px-4">
              <h1 className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-xl font-bold text-transparent">
                Nyra
              </h1>
              <p className="mt-1 text-xs text-purple-300/60">
                Neural Command Deck
              </p>
            </div>

            {/* Navigation */}
            <SidebarNav />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </div>
  );
}
