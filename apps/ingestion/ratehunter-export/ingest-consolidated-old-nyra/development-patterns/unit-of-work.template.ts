/**
 * Unit of Work Template
 *
 * Pattern: Unit of Work Pattern
 * Purpose: Manage transactions across multiple repository operations
 *
 * Usage:
 *   1. Copy to: services/{service}/src/repositories/unit-of-work.ts
 *   2. Add your repository types
 *   3. Implement transaction boundaries
 *
 * @author {{author}}
 * @date {{date}}
 */

import { PrismaClient } from '@prisma/client';
import { Logger } from '@nyra/shared/logger';

// Import your repositories
// import { UserRepository } from './user.repository';
// import { LeadRepository } from './lead.repository';
// import { OrderRepository } from './order.repository';

/**
 * Unit of Work interface defining transaction management
 */
export interface IUnitOfWork {
  // Add your repository interfaces here
  // users: UserRepository;
  // leads: LeadRepository;
  // orders: OrderRepository;

  /**
   * Execute operations in a transaction
   */
  executeTransaction<T>(work: (uow: UnitOfWork) => Promise<T>): Promise<T>;

  /**
   * Commit current transaction
   */
  commit(): Promise<void>;

  /**
   * Rollback current transaction
   */
  rollback(): Promise<void>;
}

/**
 * Unit of Work implementation using Prisma transactions
 *
 * Manages transactions across multiple repositories, ensuring
 * all operations succeed or fail together.
 *
 * @example
 * ```typescript
 * const uow = new UnitOfWork(prisma, logger);
 *
 * await uow.executeTransaction(async (txUow) => {
 *   const user = await txUow.users.create(userData);
 *   const lead = await txUow.leads.create({
 *     ...leadData,
 *     userId: user.id
 *   });
 *
 *   return { user, lead };
 * });
 * ```
 */
export class UnitOfWork implements IUnitOfWork {
  private transactionClient?: PrismaClient;

  // Lazy-loaded repositories
  // private _users?: UserRepository;
  // private _leads?: LeadRepository;
  // private _orders?: OrderRepository;

  constructor(
    private prisma: PrismaClient,
    private logger?: Logger
  ) {}

  /**
   * Get the Prisma client (transaction client if in transaction)
   */
  private getClient(): PrismaClient {
    return this.transactionClient || this.prisma;
  }

  /**
   * Execute operations within a transaction
   *
   * All operations will be committed or rolled back together.
   * If any operation fails, the entire transaction is rolled back.
   *
   * @param work - Function containing transactional operations
   * @returns Result of the work function
   * @throws Error if transaction fails
   */
  async executeTransaction<T>(
    work: (uow: UnitOfWork) => Promise<T>
  ): Promise<T> {
    this.logger?.debug('Starting transaction');

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Create new UoW with transaction client
        const txUow = new UnitOfWork(tx as PrismaClient, this.logger);
        txUow.transactionClient = tx as PrismaClient;

        return work(txUow);
      });

      this.logger?.debug('Transaction committed successfully');
      return result;
    } catch (error) {
      this.logger?.error('Transaction failed, rolling back', error);
      throw error;
    }
  }

  /**
   * Commit current transaction
   *
   * Note: When using executeTransaction, commits are automatic.
   * This method is for manual transaction management.
   */
  async commit(): Promise<void> {
    if (this.transactionClient) {
      this.logger?.debug('Committing transaction');
      // Prisma handles commit automatically at end of transaction
    } else {
      this.logger?.warn('No active transaction to commit');
    }
  }

  /**
   * Rollback current transaction
   *
   * Note: When using executeTransaction, rollbacks are automatic on error.
   * This method is for manual transaction management.
   */
  async rollback(): Promise<void> {
    if (this.transactionClient) {
      this.logger?.debug('Rolling back transaction');
      // Throw error to trigger Prisma rollback
      throw new Error('Transaction rolled back');
    } else {
      this.logger?.warn('No active transaction to rollback');
    }
  }

  // ========== Repository Getters ==========
  // Add lazy-loaded repository getters here

  /*
  get users(): UserRepository {
    if (!this._users) {
      this._users = new UserRepository(this.getClient(), this.logger);
    }
    return this._users;
  }

  get leads(): LeadRepository {
    if (!this._leads) {
      this._leads = new LeadRepository(this.getClient(), this.logger);
    }
    return this._leads;
  }

  get orders(): OrderRepository {
    if (!this._orders) {
      this._orders = new OrderRepository(this.getClient(), this.logger);
    }
    return this._orders;
  }
  */
}

/**
 * Example Usage:
 *
 * // Simple transaction
 * const uow = new UnitOfWork(prisma, logger);
 *
 * const result = await uow.executeTransaction(async (txUow) => {
 *   const user = await txUow.users.create({
 *     email: 'user@example.com',
 *     name: 'John Doe'
 *   });
 *
 *   const lead = await txUow.leads.create({
 *     userId: user.id,
 *     source: 'website',
 *     status: 'new'
 *   });
 *
 *   return { user, lead };
 * });
 *
 * // Complex transaction with error handling
 * try {
 *   await uow.executeTransaction(async (txUow) => {
 *     // Create user
 *     const user = await txUow.users.create(userData);
 *
 *     // Create associated records
 *     await txUow.leads.create({ userId: user.id, ...leadData });
 *     await txUow.orders.create({ userId: user.id, ...orderData });
 *
 *     // Validate business rules
 *     if (user.email.endsWith('@blocked-domain.com')) {
 *       throw new Error('Email domain not allowed');
 *     }
 *
 *     return user;
 *   });
 * } catch (error) {
 *   // All changes rolled back
 *   console.error('Transaction failed:', error);
 * }
 *
 * // Nested transactions (use with caution)
 * await uow.executeTransaction(async (txUow) => {
 *   const user = await txUow.users.create(userData);
 *
 *   // Inner transaction
 *   await txUow.executeTransaction(async (innerTxUow) => {
 *     await innerTxUow.leads.create({ userId: user.id, ...leadData });
 *   });
 *
 *   return user;
 * });
 */

/**
 * Best Practices:
 *
 * 1. Keep transactions short
 *    - Long-running transactions can cause performance issues
 *    - Only include operations that must be atomic
 *
 * 2. Avoid external calls in transactions
 *    - Don't call external APIs within transactions
 *    - Move external calls outside transaction or use saga pattern
 *
 * 3. Handle errors properly
 *    - Let errors bubble up to trigger automatic rollback
 *    - Log errors for debugging
 *
 * 4. Use lazy loading for repositories
 *    - Only instantiate repositories when needed
 *    - Reduces memory overhead
 *
 * 5. Consider saga pattern for distributed transactions
 *    - Use for operations spanning multiple microservices
 *    - Implement compensating transactions
 */
