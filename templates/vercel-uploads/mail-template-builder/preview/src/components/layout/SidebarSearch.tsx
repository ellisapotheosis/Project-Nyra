'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SidebarSearchProps {
  isCollapsed: boolean;
}

export function SidebarSearch({ isCollapsed }: SidebarSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (isCollapsed) {
    return (
      <div className="p-4 flex justify-center">
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <Search className="w-5 h-5 text-gray-500 dark:text-gray-400 cursor-pointer" />
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer" />
        <Input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        />
      </div>
    </div>
  );
}
