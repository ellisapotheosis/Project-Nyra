import { z } from "zod";

export const UserRoleSchema = z.enum([
  "ADMIN",
  "BROKER",
  "ASSISTANT",
  "AUDITOR",
]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export interface Permission {
  action: string;
  resource: string;
}

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: ["*"],
  BROKER: [
    "read:leads",
    "write:leads",
    "read:quotes",
    "write:quotes",
    "read:campaigns",
    "execute:orchestration",
  ],
  ASSISTANT: ["read:leads", "read:quotes", "read:memory", "propose:actions"],
  AUDITOR: ["read:leads", "read:quotes", "read:audit-log"],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (permissions.includes("*")) return true;
  return permissions.includes(permission);
}

export function mapClerkRole(clerkRole: string): UserRole {
  switch (clerkRole?.toUpperCase()) {
    case "ORG:ADMIN":
      return "ADMIN";
    case "ORG:BROKER":
    case "ORG:MEMBER":
      return "BROKER";
    case "ORG:ASSISTANT":
      return "ASSISTANT";
    case "ORG:AUDITOR":
      return "AUDITOR";
    default:
      return "BROKER"; // Default to broker for security (or throw error)
  }
}
