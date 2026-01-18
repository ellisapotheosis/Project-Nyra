import { z } from 'zod';

// ============================================================================
// OAuth2 Configuration Types
// ============================================================================

export const OAuth2ConfigSchema = z.object({
  enabled: z.boolean().default(false),
  jwksEndpoint: z.string().url().optional(),
  expectedIssuer: z.string().optional(),
  expectedAudience: z.string().optional(),
  tokenValidation: z.boolean().default(true),
  cacheJwks: z.boolean().default(true),
  jwksCacheTtl: z.number().default(3600000), // 1 hour
  clockTolerance: z.number().default(60), // 60 seconds
  algorithms: z.array(z.string()).default(['RS256', 'RS384', 'RS512']),
});

export type OAuth2Config = z.infer<typeof OAuth2ConfigSchema>;

// ============================================================================
// JWT Token Types
// ============================================================================

export interface JWTPayload {
  sub: string; // Subject (user ID)
  iss?: string; // Issuer
  aud?: string | string[]; // Audience
  exp?: number; // Expiration
  nbf?: number; // Not before
  iat?: number; // Issued at
  jti?: string; // JWT ID
  groups?: string[]; // User groups for RBAC
  permissions?: string[]; // Direct permissions
  [key: string]: any; // Additional claims
}

export interface TokenValidationResult {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
  reason?: string;
}

// ============================================================================
// Permission Matrix Types
// ============================================================================

export const PermissionOverrideSchema = z.object({
  allowGroups: z.array(z.string()).default([]),
  denyGroups: z.array(z.string()).default([]),
});

export const ToolPermissionsSchema = z.object({
  allowGroups: z.array(z.string()).default([]),
  denyGroups: z.array(z.string()).default([]),
  toolOverrides: z
    .record(z.string(), PermissionOverrideSchema)
    .default({}),
});

export const PermissionsMatrixSchema = z.record(
  z.string(),
  ToolPermissionsSchema
);

export type PermissionOverride = z.infer<typeof PermissionOverrideSchema>;
export type ToolPermissions = z.infer<typeof ToolPermissionsSchema>;
export type PermissionsMatrix = z.infer<typeof PermissionsMatrixSchema>;

// ============================================================================
// User Group Types
// ============================================================================

export const UserGroupSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  permissions: z.array(z.string()).default([]),
  memberCount: z.number().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
});

export type UserGroup = z.infer<typeof UserGroupSchema>;

// ============================================================================
// Authorization Decision Types
// ============================================================================

export interface AuthorizationContext {
  userId: string;
  groups: string[];
  permissions: string[];
  serverId?: string;
  toolId?: string;
  action?: string;
}

export interface AuthorizationDecision {
  allowed: boolean;
  reason?: string;
  matchedGroups?: string[];
  deniedBy?: string;
  appliedRule?: 'allow' | 'deny' | 'default';
}

// ============================================================================
// Security Audit Types
// ============================================================================

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  eventType: 'auth' | 'access' | 'config_change' | 'violation';
  userId?: string;
  action: string;
  resource?: string;
  result: 'success' | 'failure' | 'denied';
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Security Health Types
// ============================================================================

export interface SecurityHealth {
  oauth2: {
    enabled: boolean;
    configured: boolean;
    jwksReachable?: boolean;
    lastValidation?: string;
  };
  permissions: {
    configured: boolean;
    serverCount: number;
    groupCount: number;
  };
  audit: {
    enabled: boolean;
    recentViolations: number;
    lastAuditEntry?: string;
  };
}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface OAuth2ConfigUpdateRequest {
  enabled?: boolean;
  jwksEndpoint?: string;
  expectedIssuer?: string;
  expectedAudience?: string;
  tokenValidation?: boolean;
}

export interface PermissionsUpdateRequest {
  serverId: string;
  allowGroups?: string[];
  denyGroups?: string[];
  toolOverrides?: Record<string, PermissionOverride>;
}

export interface GroupCreateRequest {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface GroupUpdateRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface TokenTestRequest {
  token: string;
  expectedGroups?: string[];
}

export interface TokenTestResponse {
  valid: boolean;
  payload?: JWTPayload;
  groups?: string[];
  permissions?: string[];
  errors?: string[];
  warnings?: string[];
}
