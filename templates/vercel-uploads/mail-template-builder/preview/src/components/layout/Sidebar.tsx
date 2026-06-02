'use client';

import { useSidebarStore } from '@/stores/sidebarStore';
import { cn } from '@/lib/utils';
import { SidebarHeader } from './SidebarHeader';
import { SidebarSearch } from './SidebarSearch';
import { SidebarMenuItem } from './SidebarMenuItem';
import { SidebarFooter } from './SidebarFooter';
import { menuItems } from './menuItems';

export function Sidebar() {
  const { isCollapsed } = useSidebarStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-50',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header with Avatar and Toggle */}
        <SidebarHeader />

        {/* Search Input */}
        <SidebarSearch isCollapsed={isCollapsed} />

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id} item={item} isCollapsed={isCollapsed} />
            ))}
          </div>
        </nav>

        {/* Footer Info */}
        {!isCollapsed && <SidebarFooter />}
      </div>
    </aside>
  );
}
