'use client';

import { useState, forwardRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/components/ThemeProvider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Mail, Globe, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface SidebarUserMenuProps {
  isCollapsed: boolean;
  onClose: () => void;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const SidebarUserMenu = forwardRef<HTMLDivElement, SidebarUserMenuProps>(
  ({ isCollapsed, onClose }, ref) => {
    const { user, logout } = useAuthStore();
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [language, setLanguage] = useState('en');

    const handleLogout = () => {
      logout();
      toast.success('Logged out successfully');
      router.push('/login');
      onClose();
    };

    const toggleDarkMode = () => {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
      <div
        ref={ref}
        className={cn(
          'absolute top-full mt-2 bg-gray-950 border border-gray-800 rounded-lg shadow-xl z-[100]',
          'animate-in fade-in slide-in-from-top-2 duration-200',
          isCollapsed ? 'left-20 ml-2 w-64' : 'left-4 right-4'
        )}
      >
        {/* Header */}
        <div className="border-b border-gray-800 p-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white font-semibold text-sm">
                {user && getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <h3 className="text-sm font-semibold text-white">
                {user?.name || 'User'}
              </h3>
              <p className="text-xs text-gray-400">{user?.email || 'demo@kt.com'}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          {/* My Profile */}
          <Link
            href="/profile"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-3 rounded hover:bg-gray-800 transition-colors"
          >
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-200">My Profile</span>
          </Link>

          {/* My Template */}
          <Link
            href="/templates"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-3 rounded hover:bg-gray-800 transition-colors"
          >
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-200">My Template</span>
          </Link>

          {/* Language */}
          <div className="flex items-center justify-between px-3 py-2 rounded hover:bg-gray-800 transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-200">Language</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setLanguage('en')}
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer',
                  language === 'en'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                )}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('id')}
                className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer',
                  language === 'id'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                )}
              >
                ID
              </button>
            </div>
          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between px-3 py-3 rounded hover:bg-gray-800 transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5">
              <Moon className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-200">Dark Mode</span>
            </div>
            <button
              onClick={toggleDarkMode}
              className={cn(
                'relative w-9 h-5 rounded-full transition-colors cursor-pointer',
                theme === 'dark' ? 'bg-blue-600' : 'bg-gray-700'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform',
                  theme === 'dark' && 'translate-x-4'
                )}
              />
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <div className="border-t border-gray-800 p-2">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-center h-9 text-xs font-medium text-gray-200 border-gray-700 hover:bg-gray-800 hover:text-white hover:border-gray-600 cursor-pointer"
          >
            Logout
          </Button>
        </div>
      </div>
    );
  }
);

SidebarUserMenu.displayName = 'SidebarUserMenu';
