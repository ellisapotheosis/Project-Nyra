'use client';

import { useState, useRef, useEffect } from 'react';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useAuthStore } from '@/stores/authStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarUserMenu } from './SidebarUserMenu';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export function SidebarHeader() {
  const { isCollapsed, toggleSidebar } = useSidebarStore();
  const { user } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        avatarRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <>
      {/* Header with Avatar and Toggle */}
      <div className={cn(
        'flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800 relative',
        isCollapsed && 'justify-center'
      )}>
        {!isCollapsed && user && (
          <button
            ref={avatarRef}
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-10 w-10 cursor-pointer">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <h1 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user.name}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </button>
        )}
        {isCollapsed && user && (
          <button
            ref={avatarRef}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <Avatar className="h-10 w-10 cursor-pointer">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </button>
        )}
        {!isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-5 h-5 text-gray-500 dark:text-gray-400 cursor-pointer" />
          </button>
        )}

        {/* User Menu Dropdown */}
        {showUserMenu && (
          <SidebarUserMenu
            ref={dropdownRef}
            isCollapsed={isCollapsed}
            onClose={() => setShowUserMenu(false)}
          />
        )}
      </div>

      {/* Expand Button when Collapsed */}
      {isCollapsed && (
        <div className="p-2 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={toggleSidebar}
            className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            title="Expand sidebar"
          >
            <PanelLeft className="w-5 h-5 text-gray-500 dark:text-gray-400 mx-auto" />
          </button>
        </div>
      )}
    </>
  );
}
