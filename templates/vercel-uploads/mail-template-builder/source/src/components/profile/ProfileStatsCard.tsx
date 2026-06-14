'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ProfileStatsCard() {
  return (
    <div className="space-y-6">
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Account Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Templates Created</span>
            <span className="font-bold text-2xl dark:text-white">0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Last Login</span>
            <span className="font-semibold text-sm dark:text-gray-300">
              {new Date().toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Account Status</span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
              Active
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-300">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link href="/templates">
            <Button variant="outline" className="w-full bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 mb-2">
              View Templates
            </Button>
          </Link>
          <Link href="/editor">
            <Button variant="outline" className="w-full bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700">
              Create Template
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
