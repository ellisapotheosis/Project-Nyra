'use client'

import { Bell, Search, Menu, ChevronDown, LogOut, User as UserIcon, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useRef, useEffect } from 'react'

interface HeaderProps {
  title?: string
  description?: string
  onMenuClick?: () => void
  showMobileMenu?: boolean
}

export function Header({
  title = "Dashboard",
  description = "Mortgage operations overview",
  onMenuClick,
  showMobileMenu = false
}: HeaderProps) {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-red-400'
      case 'loan_officer':
        return 'text-cyan-400'
      case 'processor':
        return 'text-violet-400'
      case 'underwriter':
        return 'text-green-400'
      default:
        return 'text-slate-400'
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/50 px-6 backdrop-blur">
      <div className="flex items-center gap-4">
        {showMobileMenu && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-slate-100">{title}</h1>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="hidden md:flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads, quotes..."
              className="h-9 w-64 rounded-lg border border-slate-700 bg-slate-800/50 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
              3
            </span>
          </Button>
        </div>

        {/* Settings */}
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-2"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-400 text-white text-xs font-medium">
              {user ? getInitials(user.name) : 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-sm font-medium text-slate-200">
                {user?.name || 'User'}
              </div>
              <div className={`text-xs ${getRoleColor(user?.role || '')}`}>
                {user?.role?.replace('_', ' ') || 'Guest'}
              </div>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </Button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-slate-800 bg-slate-900 shadow-lg z-50">
              <div className="p-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-400 text-white font-medium">
                    {user ? getInitials(user.name) : 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-100">{user?.name || 'User'}</p>
                    <p className="text-sm text-slate-400">{user?.email || 'user@nyra.com'}</p>
                    <p className={`text-xs ${getRoleColor(user?.role || '')}`}>
                      {user?.role?.replace('_', ' ') || 'Guest'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                  onClick={() => {
                    setShowUserMenu(false)
                    // Navigate to profile
                  }}
                >
                  <UserIcon className="h-4 w-4" />
                  Profile Settings
                </button>

                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                  onClick={() => {
                    setShowUserMenu(false)
                    logout()
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* System Status Indicator */}
        <div className="hidden xl:flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/30 px-3 py-1.5">
          <div className="flex h-2 w-2 rounded-full bg-green-400"></div>
          <span className="text-xs text-slate-300">All Systems Operational</span>
        </div>
      </div>
    </header>
  )
}

// Breadcrumb component for navigation context
interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-400">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <span className="mx-2">/</span>}
          {item.href ? (
            <a
              href={item.href}
              className="hover:text-slate-200 transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-slate-200 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
