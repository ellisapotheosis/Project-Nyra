'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: {
    id: string;
    label: string;
    href: string;
  }[];
}

interface SidebarMenuItemProps {
  item: MenuItem;
  isCollapsed: boolean;
}

export function SidebarMenuItem({ item, isCollapsed }: SidebarMenuItemProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href ? pathname === item.href : false;
  const Icon = item.icon;

  const toggleOpen = () => {
    if (!isCollapsed && hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  if (hasChildren) {
    return (
      <div className="mb-1">
        <button
          onClick={toggleOpen}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group cursor-pointer',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            isCollapsed && 'justify-center px-3'
          )}
          title={isCollapsed ? item.label : undefined}
        >
          <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.label}
              </span>
              {isOpen ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </>
          )}
        </button>
        {!isCollapsed && (
          <div
            className={cn(
              'ml-8 mt-1 overflow-hidden transition-all duration-300 ease-in-out cursor-pointer',
              isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            <div className={cn(
              'space-y-1 transition-transform duration-300',
              isOpen ? 'translate-y-0' : '-translate-y-2'
            )}>
              {item.children?.map((child) => (
                <Link
                  key={child.id}
                  href={child.href}
                  className={cn(
                    'block px-4 py-2 rounded-lg text-sm transition-colors',
                    pathname === child.href
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href || '#'}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 group',
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
        isCollapsed && 'justify-center px-3'
      )}
      title={isCollapsed ? item.label : undefined}
    >
      <Icon className={cn(
        'w-5 h-5 flex-shrink-0',
        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
      )} />
      {!isCollapsed && (
        <span className="text-sm font-medium">{item.label}</span>
      )}
    </Link>
  );
}
