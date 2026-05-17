"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRole, canAccessRoute } from "@/lib/rbac";
import { useAuth } from "@/lib/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoute: string;
}

/**
 * HOC to protect routes based on user role
 * Redirects to /access-denied if user doesn't have permission
 */
export function ProtectedRoute({
  children,
  requiredRoute,
}: ProtectedRouteProps) {
  const { loading } = useAuth();
  const role = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role && !canAccessRoute(role, requiredRoute)) {
      router.push("/access-denied");
    }
  }, [role, loading, requiredRoute, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-cyan-400"></div>
          <p className="text-purple-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!role || !canAccessRoute(role, requiredRoute)) {
    return null;
  }

  return <>{children}</>;
}
