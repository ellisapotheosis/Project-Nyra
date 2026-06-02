'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut } from 'lucide-react';

interface ProfileHeaderProps {
  onLogout: () => void;
}

export function ProfileHeader({ onLogout }: ProfileHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Link href="/templates">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your account settings</p>
        </div>
      </div>
      <Button variant="destructive" onClick={onLogout} className="gap-2">
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </div>
  );
}
