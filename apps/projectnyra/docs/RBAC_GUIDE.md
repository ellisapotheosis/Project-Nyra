# Role-Based Access Control (RBAC) Guide

Project Nyra implements a comprehensive role-based access control system to manage user permissions across the application.

## User Roles

### Admin

- Full access to all features and settings
- Can manage users and system configuration
- Can view audit logs and compliance reports
- Access to: All routes and resources

### Broker

- Can manage leads, campaigns, and quotes
- Full access to CRM and integrations
- Can access system monitoring tools
- Access to: Dashboard, CRM, Drip Builder, Campaigns, Quotes, Nexus Router, OpenClaw, Nerve, Memory, Tools

### Loan Officer

- Can work with leads and create quotes
- Limited to broker platform features
- Can view compliance information
- Access to: Dashboard, CRM, Campaigns, Quotes, OpenClaw, Tools

### Processor

- Can process and update leads
- Read-only access to compliance data
- Limited to operational tasks
- Access to: Dashboard, Quotes, Logs

### Viewer

- Read-only access to leads, campaigns, and quotes
- Can view dashboards and reports
- Cannot modify any data
- Access to: Dashboard

## Using RBAC in Components

### Hooks

#### useRole()

Get the current user's role:

```tsx
import { useRole } from "@/lib/rbac";

export function MyComponent() {
  const role = useRole();
  return <div>{role}</div>;
}
```

#### useHasPermission()

Check if user has specific permission:

```tsx
import { useHasPermission } from "@/lib/rbac";

export function EditButton() {
  const canEdit = useHasPermission("leads", "update");
  return canEdit ? <button>Edit</button> : null;
}
```

### Components

#### RoleGate

Conditionally render content based on role:

```tsx
import { RoleGate } from "@/components/RoleGate";

export function AdminOnly() {
  return (
    <RoleGate allowedRoles={["admin"]} fallback={<p>Access Denied</p>}>
      <AdminPanel />
    </RoleGate>
  );
}
```

#### ProtectedRoute

HOC to protect entire routes:

```tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRoute="/admin">
      <AdminPanel />
    </ProtectedRoute>
  );
}
```

## SidebarNav Integration

The SidebarNav automatically hides routes based on user role:

- Routes are filtered using `canAccessRoute(role, path)`
- Unauthorized routes don't appear in navigation
- Users trying to access restricted routes get `/access-denied`

## TypeScript Types

```tsx
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
```

## Best Practices

1. Always use hooks/components - Don't manually check roles
2. Filter navigation - Hide unavailable options
3. Protect routes - Use ProtectedRoute for sensitive pages
4. Graceful fallbacks - Show helpful messages
5. Fetch roles from database - Don't hardcode roles
