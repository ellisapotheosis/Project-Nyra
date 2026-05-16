'use client';

import Link from 'next/link';
import { AlertTriangle, Home } from 'lucide-react';

export default function AccessDeniedPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-black">
      <div className="text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-red-400 mb-4" />
        <h1 className="mb-2 text-3xl font-bold text-white">Access Denied</h1>
        <p className="mb-8 text-purple-300/70">
          You don't have permission to access this resource.
        </p>
        <p className="mb-6 text-sm text-purple-300/60">
          Your role does not grant access to this page. Contact your administrator if you believe this is an error.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition hover:bg-purple-700"
        >
          <Home className="h-4 w-4" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
