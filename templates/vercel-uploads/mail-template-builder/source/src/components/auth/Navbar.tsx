'use client';

import Link from 'next/link';
import { UserMenu } from './UserMenu';
import { DarkModeToggle } from '../DarkModeToggle';
import { Mail } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="border-b bg-white dark:bg-gray-900 dark:border-gray-800 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl dark:text-white">
            <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Mail Template Builder</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/templates"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Templates
            </Link>
            <Link
              href="/editor"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Editor
            </Link>
          </div>

          {/* Right side: Dark Mode Toggle + User Menu */}
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
