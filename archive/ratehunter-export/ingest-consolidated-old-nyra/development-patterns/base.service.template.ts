/**
 * Base Service Template
 *
 * Pattern: Service Layer Pattern
 * Purpose: Centralize business logic and coordinate operations
 *
 * Usage:
 *   1. Copy to: services/{service}/src/services/base.service.ts
 *   2. Replace {{ServiceName}} with your service name
 *   3. Implement concrete services extending this base
 *
 * @author {{author}}
 * @date {{date}}
 */

import { IRepository } from '../repositories/base.repository';
import { IUnitOfWork } from '../repositories/unit-of-work';
import { EventBus } from '@nyra/shared/events';
import { Logger } from '@nyra/shared/logger';
import { ValidationError, NotFoundError, ConflictError } from '@nyra/shared/errors';

/**
 * Generic service interface defining business operations
 */
export interface IService<T> {
  findById(id: string): Promise<T | null>;
  findAll(filters?: any): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

/**
 * Base service implementation with hooks for business logic
 *
 * @template T The entity type this service manages
 *
 * @example
 * ```typescript
 * class UserService extends BaseService<User> {
 *   protected get entityName() {
 *     return 'User';
 *   }
 *
 *   protected async validateCreate(data: Partial<User>) {
 *     if (!data.email) {
 *       throw new ValidationError('Email is required');
 *     }
 *   }
 *
 *   protected async afterCreate(user: User) {
 *     await this.eventBus.publish(new UserCreatedEvent(user));
 *   }
 * }
 * ```
 */
export abstract class BaseService<T> implements IService<T> {
  constructor(
    protected repository: IRepository<T>,
    protected uow: IUnitOfWork,
    protected eventBus: EventBus,
    protected logger: Logger
  ) {}

  /**
   * Get the entity name for logging and error messages
   */
  protected abstract get entityName(): string;

  /**
   * Find entity by ID
   *
   * @param id - Entity ID
   * @returns Entity or null if not found
   * @throws {NotFoundError} If entity not found (when throwIfNotFound is true)
   */
  async findById(id: string, throwIfNotFound = false): Promise<T | null> {
    this.logger.debug(`Finding ${this.entityName} by id: ${id}`);

    const entity = await this.repository.findById(id);

    if (!entity && throwIfNotFound) {
      throw new NotFoundError(`${this.entityName} not found: ${id}`);
    }

    return entity;
  }

  /**
   * Find all entities matching filters
   *
   * @param filters - Query filters
   * @returns Array of entities
   */
  async findAll(filters?: any): Promise<T[]> {
    this.logger.debug(`Finding all ${this.entityName}s`, { filters });

    return this.repository.findAll(filters);
  }

  /**
   * Create new entity
   *
   * @param data - Entity data
   * @returns Created entity
   * @throws {ValidationError} If validation fails
   * @throws {ConflictError} If entity already exists
   */
  async create(data: Partial<T>): Promise<T> {
    this.logger.info(`Creating ${this.entityName}`, { data });

    // Validate input
    await this.validateCreate(data);

    // Execute in transaction
    return this.uow.executeTransaction(async (txUow) => {
      // Before create hook
      await this.beforeCreate(data);

      // Create entity
      const entity = await this.repository.create(data);

      // After create hook
      await this.afterCreate(entity);

      this.logger.info(`Created ${this.entityName}`, { id: (entity as any).id });

      return entity;
    });
  }

  /**
   * Update existing entity
   *
   * @param id - Entity ID
   * @param data - Updated data
   * @returns Updated entity
   * @throws {NotFoundError} If entity not found
   * @throws {ValidationError} If validation fails
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    this.logger.info(`Updating ${this.entityName}: ${id}`, { data });

    // Check entity exists
    await this.findById(id, true);

    // Validate update
    await this.validateUpdate(id, data);

    // Execute in transaction
    return this.uow.executeTransaction(async (txUow) => {
      // Before update hook
      await this.beforeUpdate(id, data);

      // Update entity
      const entity = await this.repository.update(id, data);

      // After update hook
      await this.afterUpdate(entity);

      this.logger.info(`Updated ${this.entityName}: ${id}`);

      return entity;
    });
  }

  /**
   * Delete entity
   *
   * @param id - Entity ID
   * @throws {NotFoundError} If entity not found
   * @throws {ValidationError} If deletion not allowed
   */
  async delete(id: string): Promise<void> {
    this.logger.info(`Deleting ${this.entityName}: ${id}`);

    // Check entity exists
    const entity = await this.findById(id, true);

    // Validate deletion
    await this.validateDelete(id);

    // Execute in transaction
    return this.uow.executeTransaction(async (txUow) => {
      // Before delete hook
      await this.beforeDelete(id, entity!);

      // Delete entity
      await this.repository.delete(id);

      // After delete hook
      await this.afterDelete(id, entity!);

      this.logger.info(`Deleted ${this.entityName}: ${id}`);
    });
  }

  /**
   * Count entities matching filters
   *
   * @param filters - Query filters
   * @returns Count of matching entities
   */
  async count(filters?: any): Promise<number> {
    this.logger.debug(`Counting ${this.entityName}s`, { filters });

    return this.repository.count(filters);
  }

  /**
   * Check if entity exists
   *
   * @param id - Entity ID
   * @returns True if entity exists
   */
  async exists(id: string): Promise<boolean> {
    return this.repository.exists(id);
  }

  // ========== Validation Hooks ==========

  /**
   * Validate data before creating entity
   * Override to implement custom validation logic
   *
   * @param data - Entity data to validate
   * @throws {ValidationError} If validation fails
   */
  protected async validateCreate(data: Partial<T>): Promise<void> {
    // Override in concrete service
  }

  /**
   * Validate data before updating entity
   * Override to implement custom validation logic
   *
   * @param id - Entity ID
   * @param data - Updated data to validate
   * @throws {ValidationError} If validation fails
   */
  protected async validateUpdate(id: string, data: Partial<T>): Promise<void> {
    // Override in concrete service
  }

  /**
   * Validate before deleting entity
   * Override to implement custom deletion rules
   *
   * @param id - Entity ID
   * @throws {ValidationError} If deletion not allowed
   */
  protected async validateDelete(id: string): Promise<void> {
    // Override in concrete service
  }

  // ========== Lifecycle Hooks ==========

  /**
   * Hook called before creating entity
   * Override to perform pre-creation operations
   *
   * @param data - Entity data
   */
  protected async beforeCreate(data: Partial<T>): Promise<void> {
    // Override in concrete service
  }

  /**
   * Hook called after creating entity
   * Override to perform post-creation operations (e.g., publish events)
   *
   * @param entity - Created entity
   */
  protected async afterCreate(entity: T): Promise<void> {
    // Override in concrete service
  }

  /**
   * Hook called before updating entity
   * Override to perform pre-update operations
   *
   * @param id - Entity ID
   * @param data - Updated data
   */
  protected async beforeUpdate(id: string, data: Partial<T>): Promise<void> {
    // Override in concrete service
  }

  /**
   * Hook called after updating entity
   * Override to perform post-update operations (e.g., publish events)
   *
   * @param entity - Updated entity
   */
  protected async afterUpdate(entity: T): Promise<void> {
    // Override in concrete service
  }

  /**
   * Hook called before deleting entity
   * Override to perform pre-deletion operations
   *
   * @param id - Entity ID
   * @param entity - Entity to be deleted
   */
  protected async beforeDelete(id: string, entity: T): Promise<void> {
    // Override in concrete service
  }

  /**
   * Hook called after deleting entity
   * Override to perform post-deletion operations (e.g., publish events)
   *
   * @param id - Deleted entity ID
   * @param entity - Deleted entity
   */
  protected async afterDelete(id: string, entity: T): Promise<void> {
    // Override in concrete service
  }
}

/**
 * Example concrete service implementation
 * Delete this section when using template
 */
/*
import { User } from '@prisma/client';
import { UserCreatedEvent, UserUpdatedEvent, UserDeletedEvent } from '../events/user.events';

export class UserService extends BaseService<User> {
  protected get entityName() {
    return 'User';
  }

  // Custom business methods
  async findByEmail(email: string): Promise<User | null> {
    this.logger.debug(`Finding user by email: ${email}`);

    return this.repository.findOne({
      where: { email: email.toLowerCase() }
    });
  }

  async activateUser(id: string): Promise<User> {
    this.logger.info(`Activating user: ${id}`);

    return this.update(id, { active: true } as Partial<User>);
  }

  async deactivateUser(id: string): Promise<User> {
    this.logger.info(`Deactivating user: ${id}`);

    return this.update(id, { active: false } as Partial<User>);
  }

  // Validation hooks
  protected async validateCreate(data: Partial<User>): Promise<void> {
    if (!data.email) {
      throw new ValidationError('Email is required');
    }

    if (!this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid email format');
    }

    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email already exists');
    }
  }

  protected async validateUpdate(id: string, data: Partial<User>): Promise<void> {
    if (data.email) {
      if (!this.isValidEmail(data.email)) {
        throw new ValidationError('Invalid email format');
      }

      const existing = await this.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new ConflictError('Email already exists');
      }
    }
  }

  protected async validateDelete(id: string): Promise<void> {
    // Check if user has active subscriptions
    const user = await this.findById(id, true);
    if ((user as any).hasActiveSubscription) {
      throw new ValidationError('Cannot delete user with active subscription');
    }
  }

  // Lifecycle hooks
  protected async beforeCreate(data: Partial<User>): Promise<void> {
    // Normalize email
    if (data.email) {
      data.email = data.email.toLowerCase();
    }

    // Set defaults
    (data as any).active = true;
    (data as any).createdAt = new Date();
  }

  protected async afterCreate(user: User): Promise<void> {
    // Publish event
    await this.eventBus.publish(new UserCreatedEvent({
      userId: user.id,
      email: user.email,
      timestamp: new Date()
    }));
  }

  protected async afterUpdate(user: User): Promise<void> {
    // Publish event
    await this.eventBus.publish(new UserUpdatedEvent({
      userId: user.id,
      timestamp: new Date()
    }));
  }

  protected async afterDelete(id: string, user: User): Promise<void> {
    // Publish event
    await this.eventBus.publish(new UserDeletedEvent({
      userId: id,
      timestamp: new Date()
    }));
  }

  // Helper methods
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
*/
