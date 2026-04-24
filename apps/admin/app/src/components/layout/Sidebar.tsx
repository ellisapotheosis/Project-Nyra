'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Calculator,
  Settings,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  description: string
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Overview and metrics'
  },
  {
    name: 'Leads',
    href: '/leads',
    icon: Users,
    badge: '12',
    description: 'Lead management and scoring'
  },
  {
    name: 'Quotes',
    href: '/quotes',
    icon: Calculator,
    description: 'Rate quotes and calculations'
  },
]

const bottomNavItems: NavigationItem[] = [
  {
    name: 'Settings',
    href: '/',
    icon: Settings,
    description: 'System configuration'
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn('flex h-full w-64 flex-col border-r border-slate-800 bg-slate-950/50', className)}>
      {/* Logo and Brand */}
      <div className="flex h-16 items-center justify-start px-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 text-white font-bold text-sm">
            N
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-slate-100">Nyra Admin</span>
            <span className="text-xs text-slate-400">Mortgage Operations</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'sidebar-nav-item group',
                  isActive && 'active'
                )}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Icon className="h-5 w-5 transition-colors" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-xs text-slate-500 group-hover:text-slate-400">
                      {item.description}
                    </span>
                  </div>
                </div>
                {item.badge && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-xs font-medium text-slate-900">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-slate-800 p-4">
        <div className="space-y-1 mb-4">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'sidebar-nav-item',
                  isActive && 'active'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{item.name}</span>
              </Link>
            )
          })}
        </div>

        {/* User Profile & Sign Out */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-400 text-white font-medium text-xs">
              EA
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-slate-200">Ellis Andersen</span>
              <span className="text-xs text-slate-400">Admin</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-400 hover:text-slate-200"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
