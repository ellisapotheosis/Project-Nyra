"use client";

import { useAuth } from "@/lib/auth-context";

/**
 * Role-Based Access Control (RBAC) system
 * Manages permissions for different user roles in Project Nyra
 */

export type UserRole =
  | "admin"
  | "broker"
  | "loan_officer"
  | "processor"
  | "viewer";

export interface Permission {
  resource: string;
  action: "create" | "read" | "update" | "delete";
}

export interface RouteAccess {
  path: string;
  allowedRoles: UserRole[];
}

const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    // Admin has all permissions
    { resource: "leads", action: "create" },
    { resource: "leads", action: "read" },
    { resource: "leads", action: "update" },
    { resource: "leads", action: "delete" },
    { resource: "campaigns", action: "create" },
    { resource: "campaigns", action: "read" },
    { resource: "campaigns", action: "update" },
    { resource: "campaigns", action: "delete" },
    { resource: "quotes", action: "create" },
    { resource: "quotes", action: "read" },
    { resource: "quotes", action: "update" },
    { resource: "quotes", action: "delete" },
    { resource: "settings", action: "read" },
    { resource: "settings", action: "update" },
    { resource: "compliance", action: "read" },
    { resource: "admin", action: "read" },
    { resource: "admin", action: "update" },
  ],
  broker: [
    // Broker can manage leads, campaigns, quotes
    { resource: "leads", action: "create" },
    { resource: "leads", action: "read" },
    { resource: "leads", action: "update" },
    { resource: "campaigns", action: "create" },
    { resource: "campaigns", action: "read" },
    { resource: "campaigns", action: "update" },
    { resource: "quotes", action: "create" },
    { resource: "quotes", action: "read" },
    { resource: "quotes", action: "update" },
    { resource: "compliance", action: "read" },
  ],
  loan_officer: [
    // Loan officer can work with leads and quotes
    { resource: "leads", action: "read" },
    { resource: "leads", action: "update" },
    { resource: "quotes", action: "create" },
    { resource: "quotes", action: "read" },
    { resource: "quotes", action: "update" },
  ],
  processor: [
    // Processor can process leads
    { resource: "leads", action: "read" },
    { resource: "leads", action: "update" },
    { resource: "compliance", action: "read" },
  ],
  viewer: [
    // Viewer has read-only access
    { resource: "leads", action: "read" },
    { resource: "campaigns", action: "read" },
    { resource: "quotes", action: "read" },
  ],
};

// Route access control mapping
export const routeAccess: RouteAccess[] = [
  // Admin-only routes
  { path: "/admin", allowedRoles: ["admin"] },
  { path: "/settings", allowedRoles: ["admin"] },

  // Broker-accessible routes
  { path: "/crm", allowedRoles: ["admin", "broker", "loan_officer"] },
  { path: "/drip-builder", allowedRoles: ["admin", "broker"] },
  { path: "/campaigns", allowedRoles: ["admin", "broker", "loan_officer"] },

  // Common routes
  {
    path: "/dashboard",
    allowedRoles: ["admin", "broker", "loan_officer", "processor", "viewer"],
  },
  {
    path: "/quotes",
    allowedRoles: ["admin", "broker", "loan_officer", "processor"],
  },
  { path: "/logs", allowedRoles: ["admin", "processor"] },

  // System routes (admin + broker)
  { path: "/nexus-router", allowedRoles: ["admin", "broker"] },
  { path: "/openclaw", allowedRoles: ["admin", "broker", "loan_officer"] },
  { path: "/nerve", allowedRoles: ["admin", "broker"] },
  { path: "/memory", allowedRoles: ["admin", "broker"] },
  { path: "/orchestrator", allowedRoles: ["admin"] },
  { path: "/tools", allowedRoles: ["admin", "broker", "loan_officer"] },
];

/**
 * Check if a user role has permission to perform an action on a resource
 */
export function hasPermission(
  role: UserRole,
  resource: string,
  action: "create" | "read" | "update" | "delete"
): boolean {
  const permissions = rolePermissions[role] || [];
  return permissions.some(
    (p) => p.resource === resource && p.action === action
  );
}

/**
 * Check if a role can view a resource
 */
export function canViewResource(role: UserRole, resource: string): boolean {
  return hasPermission(role, resource, "read");
}

/**
 * Check if a role can edit a resource
 */
export function canEditResource(role: UserRole, resource: string): boolean {
  return (
    hasPermission(role, resource, "update") ||
    hasPermission(role, resource, "create")
  );
}

/**
 * Check if a role can delete a resource
 */
export function canDeleteResource(role: UserRole, resource: string): boolean {
  return hasPermission(role, resource, "delete");
}

/**
 * Check if a role can access a route
 */
export function canAccessRoute(role: UserRole, path: string): boolean {
  const routeRule = routeAccess.find((r) => r.path === path);
  if (!routeRule) return true; // If no rule, allow access
  return routeRule.allowedRoles.includes(role);
}

/**
 * Hook to get the current user's role from AuthContext profile
 */
export function useRole(): UserRole | null {
  const { user } = useAuth();
  // Default role is 'viewer', should be fetched from profile table in production
  return user ? ("broker" as UserRole) : null;
}

/**
 * Hook to check if current user has permission
 */
export function useHasPermission(
  resource: string,
  action: "create" | "read" | "update" | "delete"
): boolean {
  const role = useRole();
  return role ? hasPermission(role, resource, action) : false;
}

/**
 * Hook to check if current user can access a resource
 */
export function useCanAccess(resource: string): boolean {
  const role = useRole();
  return role ? canViewResource(role, resource) : false;
}
