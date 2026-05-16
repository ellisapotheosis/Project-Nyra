'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function useAuthGuard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to load before checking
    if (loading) return;

    // If not authenticated, redirect to login
    if (!user) {
      router.push('/auth/login?redirect=' + window.location.pathname);
    }
  }, [user, loading, router]);

  return { isAuthenticated: !!user, loading };
}

/**
 * HOC for protecting page components from unauthenticated access
 * Usage:
 * export default withAuthGuard(MyDashboardPage);
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function ProtectedComponent(props: P): React.ReactNode {
    const { isAuthenticated, loading } = useAuthGuard();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}
