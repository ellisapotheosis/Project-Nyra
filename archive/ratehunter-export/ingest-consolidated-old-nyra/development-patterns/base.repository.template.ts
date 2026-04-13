/**
 * Base Repository Template
 *
 * Pattern: Repository Pattern
 * Purpose: Abstract data access layer
 *
 * Usage:
 *   1. Copy to: services/{service}/src/repositories/base.repository.ts
 *   2. Replace {{ServiceName}} with your entity name
 *   3. Implement concrete repositories extending this base
 *
 * @author {{author}}
 * @date {{date}}
 */

import { PrismaClient } from '@prisma/client';
import { Logger } from '@nyra/shared/logger';

/**
 * Generic repository interface defining CRUD operations
 */
export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(filters?: any): Promise<T[]>;
  findOne(filters: any): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  count(filters?: any): Promise<number>;
  exists(id: string): Promise<boolean>;
}

/**
 * Base repository implementation using Prisma ORM
 *
 * @template T The entity type this repository manages
 *
 * @example
 * ```typescript
 * class UserRepository extends BaseRepository<User> {
 *   get model() {
 *     return this.prisma.user;
 *   }
 *
 *   async findByEmail(email: string): Promise<User | null> {
 *     return this.model.findUnique({ where: { email } });
 *   }
 * }
 * ```
 */
export abstract class BaseRepository<T> implements IRepository<T> {
  constructor(
    protected prisma: PrismaClient,
    protected logger?: Logger
  ) {}

  /**
   * Get the Prisma model for this repository
   * Must be implemented by concrete repositories
   */
  protected abstract get model(): any;

  /**
   * Get the entity name for logging purposes
   */
  protected abstract get entityName(): string;

  /**
   * Find entity by ID
   *
   * @param id - Entity ID
   * @returns Entity or null if not found
   */
  async findById(id: string): Promise<T | null> {
    this.logger?.debug(`Finding ${this.entityName} by id: ${id}`);

    try {
      const result = await this.model.findUnique({
        where: { id }
      });

      if (!result) {
        this.logger?.debug(`${this.entityName} not found: ${id}`);
      }

      return result;
    } catch (error) {
      this.logger?.error(`Error finding ${this.entityName} by id: ${id}`, error);
      throw error;
    }
  }

  /**
   * Find all entities matching filters
   *
   * @param filters - Prisma where clause
   * @returns Array of entities
   */
  async findAll(filters?: any): Promise<T[]> {
    this.logger?.debug(`Finding all ${this.entityName}s`, { filters });

    try {
      return await this.model.findMany(filters);
    } catch (error) {
      this.logger?.error(`Error finding all ${this.entityName}s`, error);
      throw error;
    }
  }

  /**
   * Find single entity matching filters
   *
   * @param filters - Prisma where clause
   * @returns Entity or null if not found
   */
  async findOne(filters: any): Promise<T | null> {
    this.logger?.debug(`Finding one ${this.entityName}`, { filters });

    try {
      return await this.model.findFirst(filters);
    } catch (error) {
      this.logger?.error(`Error finding one ${this.entityName}`, error);
      throw error;
    }
  }

  /**
   * Create new entity
   *
   * @param data - Entity data
   * @returns Created entity
   */
  async create(data: Partial<T>): Promise<T> {
    this.logger?.info(`Creating ${this.entityName}`, { data });

    try {
      const result = await this.model.create({
        data: this.beforeCreate(data)
      });

      this.logger?.info(`Created ${this.entityName}`, { id: result.id });
      return result;
    } catch (error) {
      this.logger?.error(`Error creating ${this.entityName}`, error);
      throw error;
    }
  }

  /**
   * Update existing entity
   *
   * @param id - Entity ID
   * @param data - Updated data
   * @returns Updated entity
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    this.logger?.info(`Updating ${this.entityName}: ${id}`, { data });

    try {
      const result = await this.model.update({
        where: { id },
        data: this.beforeUpdate(data)
      });

      this.logger?.info(`Updated ${this.entityName}: ${id}`);
      return result;
    } catch (error) {
      this.logger?.error(`Error updating ${this.entityName}: ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete entity
   *
   * @param id - Entity ID
   */
  async delete(id: string): Promise<void> {
    this.logger?.info(`Deleting ${this.entityName}: ${id}`);

    try {
      await this.model.delete({
        where: { id }
      });

      this.logger?.info(`Deleted ${this.entityName}: ${id}`);
    } catch (error) {
      this.logger?.error(`Error deleting ${this.entityName}: ${id}`, error);
      throw error;
    }
  }

  /**
   * Count entities matching filters
   *
   * @param filters - Prisma where clause
   * @returns Count of matching entities
   */
  async count(filters?: any): Promise<number> {
    this.logger?.debug(`Counting ${this.entityName}s`, { filters });

    try {
      return await this.model.count(filters);
    } catch (error) {
      this.logger?.error(`Error counting ${this.entityName}s`, error);
      throw error;
    }
  }

  /**
   * Check if entity exists
   *
   * @param id - Entity ID
   * @returns True if entity exists
   */
  async exists(id: string): Promise<boolean> {
    this.logger?.debug(`Checking if ${this.entityName} exists: ${id}`);

    try {
      const count = await this.model.count({
        where: { id }
      });

      return count > 0;
    } catch (error) {
      this.logger?.error(`Error checking if ${this.entityName} exists: ${id}`, error);
      throw error;
    }
  }

  /**
   * Hook called before creating entity
   * Override to transform data before insert
   *
   * @param data - Entity data
   * @returns Transformed data
   */
  protected beforeCreate(data: Partial<T>): Partial<T> {
    return data;
  }

  /**
   * Hook called before updating entity
   * Override to transform data before update
   *
   * @param data - Entity data
   * @returns Transformed data
   */
  protected beforeUpdate(data: Partial<T>): Partial<T> {
    return data;
  }

  /**
   * Execute raw query
   * Use with caution - prefer typed methods
   *
   * @param query - Raw SQL query
   * @param params - Query parameters
   * @returns Query results
   */
  protected async executeRaw(query: string, params?: any[]): Promise<any> {
    this.logger?.debug('Executing raw query', { query, params });

    try {
      return await this.prisma.$queryRawUnsafe(query, ...(params || []));
    } catch (error) {
      this.logger?.error('Error executing raw query', error);
      throw error;
    }
  }
}

/**
 * Example concrete repository implementation
 * Delete this section when using template
 */
/*
import { User } from '@prisma/client';

export class UserRepository extends BaseRepository<User> {
  protected get model() {
    return this.prisma.user;
  }

  protected get entityName() {
    return 'User';
  }

  // Custom query methods
  async findByEmail(email: string): Promise<User | null> {
    this.logger?.debug(`Finding user by email: ${email}`);

    return this.model.findUnique({
      where: { email }
    });
  }

  async findActive(): Promise<User[]> {
    return this.findAll({
      where: { active: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async searchByName(searchTerm: string): Promise<User[]> {
    return this.model.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }
    });
  }

  // Override hooks for custom behavior
  protected beforeCreate(data: Partial<User>): Partial<User> {
    return {
      ...data,
      email: data.email?.toLowerCase(),
      createdAt: new Date()
    };
  }
}
*/
