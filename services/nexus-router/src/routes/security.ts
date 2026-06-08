import { Router, Request, Response } from "express";
import { z } from "zod";
import { SecurityConfigService } from "../services/security-config";
import { MetricsCollectorService } from "../services/metrics-collector";
import { oauth2Middleware } from "../middleware/oauth2";
import { createLogger } from "../utils/logger";
import {
  asyncHandler,
  BadRequestError,
  NotFoundError,
} from "../middleware/error-handler";
import { SecurityHealth } from "../types/security";

const logger = createLogger("security-route");
const router = Router();
const securityConfig = SecurityConfigService.getInstance();
const metricsCollector = MetricsCollectorService.getInstance();

// ============================================================================
// Validation Schemas
// ============================================================================

const OAuth2UpdateSchema = z.object({
  enabled: z.boolean().optional(),
  jwksEndpoint: z.string().url().optional(),
  expectedIssuer: z.string().optional(),
  expectedAudience: z.string().optional(),
  tokenValidation: z.boolean().optional(),
});

const PermissionsUpdateSchema = z.object({
  serverId: z.string().min(1),
  allowGroups: z.array(z.string()).optional(),
  denyGroups: z.array(z.string()).optional(),
  toolOverrides: z
    .record(
      z.string(),
      z.object({
        allowGroups: z.array(z.string()).optional(),
        denyGroups: z.array(z.string()).optional(),
      })
    )
    .optional(),
});

const GroupCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  permissions: z.array(z.string()).optional(),
});

const GroupUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  permissions: z.array(z.string()).optional(),
});

const TokenTestSchema = z.object({
  token: z.string().min(1),
  expectedGroups: z.array(z.string()).optional(),
});

// ============================================================================
// OAuth2 Configuration Endpoints
// ============================================================================

/**
 * GET /api/security/oauth2
 * Get current OAuth2 configuration
 * NOTE: Sensitive fields are redacted for security
 */
router.get(
  "/oauth2",
  asyncHandler(async (_req: Request, res: Response) => {
    logger.info("Fetching OAuth2 configuration");
    const config = await securityConfig.getOAuth2Config();

    // Redact sensitive information
    const safeConfig = {
      enabled: config.enabled,
      jwksEndpoint: config.jwksEndpoint
        ? redactUrl(config.jwksEndpoint)
        : undefined,
      expectedIssuer: config.expectedIssuer,
      expectedAudience: config.expectedAudience,
      tokenValidation: config.tokenValidation,
      cacheJwks: config.cacheJwks,
      algorithms: config.algorithms,
    };

    res.json({
      success: true,
      data: safeConfig,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * PATCH /api/security/oauth2
 * Update OAuth2 configuration
 */
router.patch(
  "/oauth2",
  asyncHandler(async (req: Request, res: Response) => {
    logger.info("Updating OAuth2 configuration");

    // Validate request body
    const validatedData = OAuth2UpdateSchema.parse(req.body);

    // Additional validation
    if (validatedData.enabled && !validatedData.jwksEndpoint) {
      const currentConfig = await securityConfig.getOAuth2Config();
      if (!currentConfig.jwksEndpoint) {
        throw new BadRequestError(
          "JWKS endpoint is required when enabling OAuth2"
        );
      }
    }

    // Update configuration
    const updated = await securityConfig.updateOAuth2Config(validatedData);

    // Clear JWKS cache when config changes
    if (validatedData.jwksEndpoint || validatedData.enabled !== undefined) {
      (
        oauth2Middleware.constructor as unknown as {
          clearJWKSCache: () => void;
        }
      ).clearJWKSCache();
    }

    res.json({
      success: true,
      data: {
        enabled: updated.enabled,
        jwksEndpoint: updated.jwksEndpoint
          ? redactUrl(updated.jwksEndpoint)
          : undefined,
        expectedIssuer: updated.expectedIssuer,
        expectedAudience: updated.expectedAudience,
        tokenValidation: updated.tokenValidation,
      },
      message: "OAuth2 configuration updated successfully",
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * POST /api/security/oauth2/test
 * Test token validation
 */
router.post(
  "/oauth2/test",
  asyncHandler(async (req: Request, res: Response) => {
    logger.info("Testing token validation");

    // Validate request
    const { token, expectedGroups } = TokenTestSchema.parse(req.body);

    // Test validation
    const result = await oauth2Middleware.testTokenValidation(token);

    // Build response
    const response: any = {
      valid: result.valid,
      timestamp: new Date().toISOString(),
    };

    if (result.valid && result.payload) {
      response.payload = {
        sub: result.payload.sub,
        iss: result.payload.iss,
        aud: result.payload.aud,
        exp: result.payload.exp,
        iat: result.payload.iat,
      };
      response.groups = result.payload.groups || [];
      response.permissions = result.payload.permissions || [];

      // Check expected groups if provided
      if (expectedGroups && expectedGroups.length > 0) {
        const hasExpectedGroups = expectedGroups.every((group) =>
          response.groups.includes(group)
        );
        response.hasExpectedGroups = hasExpectedGroups;
        if (!hasExpectedGroups) {
          response.warnings = [
            `Token missing expected groups: ${expectedGroups.join(", ")}`,
          ];
        }
      }
    } else {
      response.errors = [
        result.error || result.reason || "Token validation failed",
      ];
    }

    res.json({
      success: result.valid,
      data: response,
    });
  })
);

// ============================================================================
// Permissions Matrix Endpoints
// ============================================================================

/**
 * GET /api/security/permissions
 * Get permissions matrix for all servers
 */
router.get(
  "/permissions",
  asyncHandler(async (_req: Request, res: Response) => {
    logger.info("Fetching permissions matrix");
    const matrix = await securityConfig.getPermissionsMatrix();

    res.json({
      success: true,
      data: matrix,
      metadata: {
        serverCount: Object.keys(matrix).length,
        totalToolOverrides: Object.values(matrix).reduce(
          (acc, server) => acc + Object.keys(server.toolOverrides || {}).length,
          0
        ),
      },
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * PATCH /api/security/permissions
 * Update permissions for a specific server
 */
router.patch(
  "/permissions",
  asyncHandler(async (req: Request, res: Response) => {
    logger.info("Updating server permissions");

    // Validate request
    const { serverId, ...permissions } = PermissionsUpdateSchema.parse(
      req.body
    );

    // Update permissions
    const updated = await securityConfig.updateServerPermissions(
      serverId,
      permissions as Parameters<
        typeof securityConfig.updateServerPermissions
      >[1]
    );

    res.json({
      success: true,
      data: updated,
      message: `Permissions updated for server: ${serverId}`,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/security/permissions/:serverId
 * Get permissions for a specific server
 */
router.get(
  "/permissions/:serverId",
  asyncHandler(async (req: Request, res: Response) => {
    const serverId = String(req.params.serverId);
    logger.info("Fetching server permissions", { serverId });

    const matrix = await securityConfig.getPermissionsMatrix();
    const serverPerms = matrix[serverId];

    if (!serverPerms) {
      throw new NotFoundError(
        `No permissions configured for server: ${serverId}`
      );
    }

    res.json({
      success: true,
      data: serverPerms,
      serverId,
      timestamp: new Date().toISOString(),
    });
  })
);

// ============================================================================
// User Groups Endpoints
// ============================================================================

/**
 * GET /api/security/groups
 * List all user groups
 */
router.get(
  "/groups",
  asyncHandler(async (_req: Request, res: Response) => {
    logger.info("Listing user groups");
    const groups = await securityConfig.listGroups();

    res.json({
      success: true,
      data: groups,
      metadata: {
        totalGroups: groups.length,
        totalMembers: groups.reduce((acc, g) => acc + g.memberCount, 0),
      },
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/security/groups/:id
 * Get a specific user group
 */
router.get(
  "/groups/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    logger.info("Fetching user group", { id });

    const group = await securityConfig.getGroup(id);
    if (!group) {
      throw new NotFoundError(`Group not found: ${id}`);
    }

    res.json({
      success: true,
      data: group,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * POST /api/security/groups
 * Create a new user group
 */
router.post(
  "/groups",
  asyncHandler(async (req: Request, res: Response) => {
    logger.info("Creating user group");

    // Validate request
    const { name, description, permissions } = GroupCreateSchema.parse(
      req.body
    );

    // Create group
    const group = await securityConfig.createGroup(
      name,
      description,
      permissions
    );

    res.status(201).json({
      success: true,
      data: group,
      message: `Group created: ${name}`,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * PATCH /api/security/groups/:id
 * Update an existing user group
 */
router.patch(
  "/groups/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    logger.info("Updating user group", { id });

    // Validate request
    const updates = GroupUpdateSchema.parse(req.body);

    // Update group
    const group = await securityConfig.updateGroup(id, updates);

    res.json({
      success: true,
      data: group,
      message: `Group updated: ${id}`,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * DELETE /api/security/groups/:id
 * Delete a user group
 */
router.delete(
  "/groups/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    logger.info("Deleting user group", { id });

    await securityConfig.deleteGroup(id);

    res.json({
      success: true,
      message: `Group deleted: ${id}`,
      timestamp: new Date().toISOString(),
    });
  })
);

// ============================================================================
// Security Health & Status Endpoints
// ============================================================================

/**
 * GET /api/security/health
 * Get security subsystem health status
 */
router.get(
  "/health",
  asyncHandler(async (_req: Request, res: Response) => {
    logger.info("Checking security health");

    const oauth2Config = await securityConfig.getOAuth2Config();
    const permissions = await securityConfig.getPermissionsMatrix();
    const groups = await securityConfig.listGroups();
    const jwksReachable = oauth2Config.jwksEndpoint
      ? await checkJwksEndpoint(oauth2Config.jwksEndpoint)
      : undefined;
    const auditLogs = metricsCollector
      .getLogs(undefined, 100)
      .filter((log) => log.service === "security");
    const recentViolations = auditLogs.filter(
      (log) => log.level === "warn" || log.context?.eventType === "violation"
    ).length;
    const lastAuditEntry = auditLogs[0]?.timestamp
      ? new Date(auditLogs[0].timestamp).toISOString()
      : undefined;

    const health: SecurityHealth = {
      oauth2: {
        enabled: oauth2Config.enabled,
        configured:
          !!oauth2Config.jwksEndpoint && !!oauth2Config.expectedIssuer,
        jwksReachable,
      },
      permissions: {
        configured: Object.keys(permissions).length > 0,
        serverCount: Object.keys(permissions).length,
        groupCount: groups.length,
      },
      audit: {
        enabled: true,
        recentViolations,
        lastAuditEntry,
      },
    };

    const isHealthy =
      !oauth2Config.enabled ||
      (oauth2Config.enabled && health.oauth2.configured);

    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      status: isHealthy ? "healthy" : "degraded",
      data: health,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * POST /api/security/cache/clear
 * Clear security configuration cache
 */
router.post(
  "/cache/clear",
  asyncHandler(async (_req: Request, res: Response) => {
    logger.info("Clearing security cache");

    securityConfig.invalidateCache();
    (
      oauth2Middleware.constructor as unknown as { clearJWKSCache: () => void }
    ).clearJWKSCache();

    res.json({
      success: true,
      message: "Security cache cleared successfully",
      timestamp: new Date().toISOString(),
    });
  })
);

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Redact sensitive parts of URL
 * e.g., https://auth.example.com/.well-known/jwks.json
 * => https://REDACTED_HOST/.well-known/jwks.json
 */
function redactUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//***${parsed.pathname}${parsed.search}`;
  } catch {
    return "***";
  }
}

async function checkJwksEndpoint(jwksEndpoint: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(jwksEndpoint, {
      method: "GET",
      signal: controller.signal,
    });
    return response.ok;
  } catch (error) {
    logger.warn("JWKS endpoint health check failed", {
      jwksEndpoint: redactUrl(jwksEndpoint),
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export { router as securityRouter };
