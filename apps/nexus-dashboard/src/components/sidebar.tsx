'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Cpu,
  Database,
  Home,
  Search,
  Settings,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const routes = [
  {
    label: 'Dashboard',
    icon: Home,
    href: '/',
    color: 'text-sky-500',
  },
  {
    label: 'MCP Servers',
    icon: Database,
    href: '/servers',
    color: 'text-violet-500',
  },
  {
    label: 'Tool Search',
    icon: Search,
    href: '/tools',
    color: 'text-pink-700',
  },
  {
    label: 'GPU Workers',
    icon: Cpu,
    href: '/gpu',
    color: 'text-orange-700',
  },
  {
    label: 'Model Routes',
    icon: Zap,
    href: '/routes',
    color: 'text-emerald-500',
  },
  {
    label: 'Configuration',
    icon: Settings,
    href: '/config',
    color: 'text-gray-500',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-y-4 border-r bg-sidebar text-sidebar-foreground">
      <div className="px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nexus Router</h1>
            <p className="text-xs text-muted-foreground">AI Orchestration Platform</p>
          </div>
        </Link>
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                pathname === route.href
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground'
              )}
            >
              <route.icon className={cn('h-5 w-5', route.color)} />
              {route.label}
            </Link>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-sidebar-accent-foreground">
            System Online
          </span>
        </div>
      </div>
    </div>
  );
}
