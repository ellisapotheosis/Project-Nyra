'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { LogOut, User, Settings, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from '@nyra/ui';
import { SidebarNav } from './SidebarNav';

export function TopStatusBar() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="border-b border-purple-500/20 bg-black/60 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="h-4 w-24 animate-pulse rounded bg-purple-500/20"></div>
          <div className="h-4 w-32 animate-pulse rounded bg-purple-500/20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-purple-500/20 bg-black/60 backdrop-blur sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: System Status & Mobile Menu */}
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <button className="lg:hidden p-2 hover:bg-purple-950/20 rounded-lg transition-colors border border-purple-500/20">
                <Menu className="h-5 w-5 text-purple-400" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-black border-r border-purple-500/20 p-0 overflow-y-auto">
              <SheetHeader className="p-6 border-b border-purple-500/20">
                <SheetTitle className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-xl font-bold text-transparent">
                  Nyra Command
                </SheetTitle>
              </SheetHeader>
              <SidebarNav />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
              <span className="text-xs font-medium text-green-400">System Online</span>
            </div>
            <span className="text-xs text-purple-300/40 hidden sm:inline">|</span>
            <span className="text-xs text-purple-300/60 hidden sm:inline uppercase tracking-widest font-black">Neural Command Deck Active</span>
          </div>
        </div>

        {/* Right: User Menu */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-950/20 px-3 py-2 hidden md:flex">
              <User className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">
                {user?.email?.split('@')[0] || 'User'}
              </span>
            </div>

            <button
              onClick={() => router.push('/settings')}
              className="rounded-lg border border-purple-500/20 bg-purple-950/20 p-2 transition hover:border-purple-500/40 hover:bg-purple-950/40"
              title="Settings"
            >
              <Settings className="h-4 w-4 text-purple-400" />
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-red-500/20 bg-red-950/20 p-2 transition hover:border-red-500/40 hover:bg-red-950/40"
              title="Logout"
            >
              <LogOut className="h-4 w-4 text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
