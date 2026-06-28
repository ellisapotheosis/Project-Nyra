import { RedisClient } from './redis-client';
import { createLogger } from '../utils/logger';
import {
  OAuth2Config,
  OAuth2ConfigSchema,
  PermissionsMatrix,
  PermissionsMatrixSchema,
  UserGroup,
  UserGroupSchema,
  AuthorizationContext,
  AuthorizationDecision,
} from '../types/security';

const logger = createLogger('security-config');

/**
 * Security Configuration Service
 * Manages OAuth2 config, permissions matrix, and user groups
 * Uses Redis for persistence with in-memory fallback
 */
export class SecurityConfigService {
  private static instance: SecurityConfigService;
  private redis: RedisClient;

  // In-memory cache with TTL
  private oauth2ConfigCache: OAuth2Config | null = null;
  private permissionsCache: PermissionsMatrix | null = null;
  private groupsCache: Map<string, UserGroup> = new Map();
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 60000; // 1 minute

  // Redis keys
  private readonly OAUTH2_KEY = 'security:oauth2:config';
  private readonly PERMISSIONS_KEY = 'security:permissions:matrix';
  private readonly GROUPS_KEY_PREFIX = 'security:groups:';

  private constructor() {
    this.redis = RedisClient.getInstance();
  }

  static getInstance(): SecurityConfigService {
    if (!SecurityConfigService.instance) {
      SecurityConfigService.instance = new SecurityConfigService();
    }
    return SecurityConfigService.instance;
  }

  // ============================================================================
  // OAuth2 Configuration Management
  // ============================================================================

  async getOAuth2Config(): Promise<OAuth2Config> {
    try {
      // Check cache first
      if (this.isCacheValid() && this.oauth2ConfigCache) {
        return this.oauth2ConfigCache;
      }

      // Try Redis
      if (this.redis.isConnected()) {
        const cached = await this.redis.get(this.OAUTH2_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          const validated = OAuth2ConfigSchema.parse(parsed);
          this.oauth2ConfigCache = validated;
          this.cacheTimestamp = Date.now();
          return validated;
        }
      }

      // Return default config
      const defaultConfig = OAuth2ConfigSchema.parse({});
      this.oauth2ConfigCache = defaultConfig;
      return defaultConfig;
    } catch (error) {
      logger.error('Failed to get OAuth2 config, returning defaults:', error);
      return OAuth2ConfigSchema.parse({});
    }
  }

  async updateOAuth2Config(config: Partial<OAuth2Config>): Promise<OAuth2Config> {
    try {
      // Get current config and merge
      const current = await this.getOAuth2Config();
      const updated = OAuth2ConfigSchema.parse({ ...current, ...config });

      // Save to Redis
      if (this.redis.isConnected()) {
        await this.redis.set(this.OAUTH2_KEY, JSON.stringify(updated));
      }

      // Update cache
      this.oauth2ConfigCache = updated;
      this.cacheTimestamp = Date.now();

      logger.info('OAuth2 config updated', { enabled: updated.enabled });
      return updated;
    } catch (error) {
      logger.error('Failed to update OAuth2 config:', error);
      throw error;
    }
  }

  // ============================================================================
  // Permissions Matrix Management
  // ============================================================================

  async getPermissionsMatrix(): Promise<PermissionsMatrix> {
    try {
      // Check cache
      if (this.isCacheValid() && this.permissionsCache) {
        return this.permissionsCache;
      }

      // Try Redis
      if (this.redis.isConnected()) {
        const cached = await this.redis.get(this.PERMISSIONS_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          const validated = PermissionsMatrixSchema.parse(parsed);
          this.permissionsCache = validated;
          this.cacheTimestamp = Date.now();
          return validated;
        }
      }

      // Return empty matrix
      const emptyMatrix: PermissionsMatrix = {};
      this.permissionsCache = emptyMatrix;
      return emptyMatrix;
    } catch (error) {
      logger.error('Failed to get permissions matrix, returning empty:', error);
      return {};
    }
  }

  async updateServerPermissions(
    serverId: string,
    permissions: Partial<PermissionsMatrix[string]>
  ): Promise<PermissionsMatrix> {
    try {
      const matrix = await this.getPermissionsMatrix();
      const current = matrix[serverId] || {
        allowGroups: [],
        denyGroups: [],
        toolOverrides: {},
      };

      matrix[serverId] = { ...current, ...permissions };

      // Validate and save
      const validated = PermissionsMatrixSchema.parse(matrix);

      if (this.redis.isConnected()) {
        await this.redis.set(this.PERMISSIONS_KEY, JSON.stringify(validated));
      }

      this.permissionsCache = validated;
      this.cacheTimestamp = Date.now();

      logger.info('Server permissions updated', { serverId });
      return validated;
    } catch (error) {
      logger.error('Failed to update server permissions:', error);
      throw error;
    }
  }

  // ============================================================================
  // User Group Management
  // ============================================================================

  async listGroups(): Promise<UserGroup[]> {
    try {
      // Check cache
      if (this.isCacheValid() && this.groupsCache.size > 0) {
        return Array.from(this.groupsCache.values());
      }

      // Try Redis
      if (this.redis.isConnected()) {
        const keys = await this.redis.keys(`${this.GROUPS_KEY_PREFIX}*`);
        const groups: UserGroup[] = [];

        for (const key of keys) {
          const data = await this.redis.get(key);
          if (data) {
            const group = UserGroupSchema.parse(JSON.parse(data));
            groups.push(group);
            this.groupsCache.set(group.id, group);
          }
        }

        this.cacheTimestamp = Date.now();
        return groups;
      }

      return Array.from(this.groupsCache.values());
    } catch (error) {
      logger.error('Failed to list groups, returning empty:', error);
      return [];
    }
  }

  async getGroup(id: string): Promise<UserGroup | null> {
    try {
      // Check cache
      if (this.isCacheValid() && this.groupsCache.has(id)) {
        return this.groupsCache.get(id) || null;
      }

      // Try Redis
      if (this.redis.isConnected()) {
        const data = await this.redis.get(`${this.GROUPS_KEY_PREFIX}${id}`);
        if (data) {
          const group = UserGroupSchema.parse(JSON.parse(data));
          this.groupsCache.set(id, group);
          return group;
        }
      }

      return null;
    } catch (error) {
      logger.error('Failed to get group, returning null:', error);
      return null;
    }
  }

  async createGroup(
    name: string,
    description?: string,
    permissions: string[] = []
  ): Promise<UserGroup> {
    try {
      const id = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const group = UserGroupSchema.parse({
        id,
        name,
        description,
        permissions,
        memberCount: 0,
        createdAt: now,
        updatedAt: now,
      });

      // Save to Redis
      if (this.redis.isConnected()) {
        await this.redis.set(
          `${this.GROUPS_KEY_PREFIX}${id}`,
          JSON.stringify(group)
        );
      }

      // Update cache
      this.groupsCache.set(id, group);

      logger.info('Group created', { id, name });
      return group;
    } catch (error) {
      logger.error('Failed to create group:', error);
      throw error;
    }
  }

  async updateGroup(
    id: string,
    updates: Partial<Pick<UserGroup, 'name' | 'description' | 'permissions'>>
  ): Promise<UserGroup> {
    try {
      const current = await this.getGroup(id);
      if (!current) {
        throw new Error('Group not found');
      }

      const updated = UserGroupSchema.parse({
        ...current,
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      // Save to Redis
      if (this.redis.isConnected()) {
        await this.redis.set(
          `${this.GROUPS_KEY_PREFIX}${id}`,
          JSON.stringify(updated)
        );
      }

      // Update cache
      this.groupsCache.set(id, updated);

      logger.info('Group updated', { id });
      return updated;
    } catch (error) {
      logger.error('Failed to update group:', error);
      throw error;
    }
  }

  async deleteGroup(id: string): Promise<void> {
    try {
      if (this.redis.isConnected()) {
        await this.redis.del(`${this.GROUPS_KEY_PREFIX}${id}`);
      }

      this.groupsCache.delete(id);
      logger.info('Group deleted', { id });
    } catch (error) {
      logger.error('Failed to delete group:', error);
      throw error;
    }
  }

  // ============================================================================
  // Authorization Logic
  // ============================================================================

  async authorize(context: AuthorizationContext): Promise<AuthorizationDecision> {
    try {
      const matrix = await this.getPermissionsMatrix();

      // If no server specified, allow by default
      if (!context.serverId) {
        return { allowed: true, appliedRule: 'default' };
      }

      const serverPerms = matrix[context.serverId];
      if (!serverPerms) {
        // No permissions configured = allow by default
        return { allowed: true, appliedRule: 'default' };
      }

      // Check deny groups first (deny overrides allow)
      const deniedByServer = context.groups.some((g) =>
        serverPerms.denyGroups.includes(g)
      );
      if (deniedByServer) {
        return {
          allowed: false,
          reason: 'User group is denied access to this server',
          deniedBy: 'server',
          appliedRule: 'deny',
        };
      }

      // Check tool-specific overrides
      if (context.toolId && serverPerms.toolOverrides[context.toolId]) {
        const toolPerms = serverPerms.toolOverrides[context.toolId];

        const deniedByTool = context.groups.some((g) =>
          toolPerms.denyGroups.includes(g)
        );
        if (deniedByTool) {
          return {
            allowed: false,
            reason: 'User group is denied access to this tool',
            deniedBy: 'tool',
            appliedRule: 'deny',
          };
        }

        // If tool has allow groups, check if user is in one
        if (toolPerms.allowGroups.length > 0) {
          const matchedGroups = context.groups.filter((g) =>
            toolPerms.allowGroups.includes(g)
          );
          if (matchedGroups.length > 0) {
            return {
              allowed: true,
              reason: 'User group has explicit access to this tool',
              matchedGroups,
              appliedRule: 'allow',
            };
          }
          return {
            allowed: false,
            reason: 'User group not in tool allow list',
            appliedRule: 'deny',
          };
        }
      }

      // Check server allow groups
      if (serverPerms.allowGroups.length > 0) {
        const matchedGroups = context.groups.filter((g) =>
          serverPerms.allowGroups.includes(g)
        );
        if (matchedGroups.length > 0) {
          return {
            allowed: true,
            reason: 'User group has access to this server',
            matchedGroups,
            appliedRule: 'allow',
          };
        }
        return {
          allowed: false,
          reason: 'User group not in server allow list',
          appliedRule: 'deny',
        };
      }

      // Default allow if no restrictions configured
      return { allowed: true, appliedRule: 'default' };
    } catch (error) {
      logger.error('Authorization check failed:', error);
      // Fail closed - deny on error
      return {
        allowed: false,
        reason: 'Authorization check failed',
        appliedRule: 'deny',
      };
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private isCacheValid(): boolean {
    return Date.now() - this.cacheTimestamp < this.CACHE_TTL;
  }

  invalidateCache(): void {
    this.oauth2ConfigCache = null;
    this.permissionsCache = null;
    this.groupsCache.clear();
    this.cacheTimestamp = 0;
    logger.info('Security config cache invalidated');
  }
}
