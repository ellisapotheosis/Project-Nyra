'use client';

export function SidebarFooter() {
  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-800">
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div className="font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          Info
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>System Online</span>
        </div>
      </div>
    </div>
  );
}
