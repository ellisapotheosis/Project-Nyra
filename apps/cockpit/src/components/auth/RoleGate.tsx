'use client';

import { useRole, UserRole, hasPermission, canAccessRoute } from '@/lib/rbac';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredRoute?: string;
  requiredPermission?: { resource: string; action: 'create' | 'read' | 'update' | 'delete' };
  fallback?: React.ReactNode;
}

/**
 * Component to conditionally render content based on user role
 * Can check roles, routes, or specific permissions
 */
export function RoleGate({
  children,
  allowedRoles,
  requiredRoute,
  requiredPermission,
  fallback = null,
}: RoleGateProps) {
  const role = useRole();

  if (!role) {
    return <>{fallback}</>;
  }

  // Check allowed roles
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  // Check route access
  if (requiredRoute && !canAccessRoute(role, requiredRoute)) {
    return <>{fallback}</>;
  }

  // Check specific permission
  if (requiredPermission) {
    if (!hasPermission(role, requiredPermission.resource, requiredPermission.action)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
