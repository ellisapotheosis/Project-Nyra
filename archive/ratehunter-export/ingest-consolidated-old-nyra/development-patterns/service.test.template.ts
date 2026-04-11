/**
 * Service Test Template
 *
 * Pattern: Test-Driven Development
 * Purpose: Comprehensive test suite for service layer
 *
 * Usage:
 *   1. Copy to: services/{service}/src/services/__tests__/{entity}.service.test.ts
 *   2. Replace {{ServiceName}} with your service name
 *   3. Add custom test cases
 *
 * @author {{author}}
 * @date {{date}}
 */

import { {{ServiceName}}Service } from '../{{serviceName}}.service';
import { {{ServiceName}}Repository } from '../../repositories/{{serviceName}}.repository';
import { UnitOfWork } from '../../repositories/unit-of-work';
import { EventBus } from '@nyra/shared/events';
import { createMockLogger } from '@nyra/shared/test-utils';
import { ValidationError, NotFoundError, ConflictError } from '@nyra/shared/errors';

describe('{{ServiceName}}Service', () => {
  let service: {{ServiceName}}Service;
  let mockRepository: jest.Mocked<{{ServiceName}}Repository>;
  let mockUow: jest.Mocked<UnitOfWork>;
  let mockEventBus: jest.Mocked<EventBus>;
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create mock repository
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      exists: jest.fn()
    } as any;

    // Create mock unit of work
    mockUow = {
      executeTransaction: jest.fn((fn) => fn(mockUow)),
      commit: jest.fn(),
      rollback: jest.fn()
    } as any;

    // Create mock event bus
    mockEventBus = {
      publish: jest.fn(),
      subscribe: jest.fn(),
      clear: jest.fn()
    } as any;

    // Create mock logger
    mockLogger = createMockLogger();

    // Instantiate service with mocks
    service = new {{ServiceName}}Service(
      mockRepository,
      mockUow,
      mockEventBus,
      mockLogger
    );
  });

  // ========== CREATE TESTS ==========

  describe('create', () => {
    const valid{{ServiceName}}Data = {
      {{field}}: '{{value}}',
      {{field2}}: '{{value2}}'
    };

    const created{{ServiceName}} = {
      id: '{{id}}',
      ...valid{{ServiceName}}Data,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should create {{serviceName}} with valid data', async () => {
      // Arrange
      mockRepository.create.mockResolvedValue(created{{ServiceName}});

      // Act
      const result = await service.create(valid{{ServiceName}}Data);

      // Assert
      expect(result).toEqual(created{{ServiceName}});
      expect(mockRepository.create).toHaveBeenCalledWith(valid{{ServiceName}}Data);
      expect(mockUow.executeTransaction).toHaveBeenCalled();
      expect(mockEventBus.publish).toHaveBeenCalled();
    });

    it('should throw ValidationError for missing required fields', async () => {
      // Arrange
      const invalid{{ServiceName}}Data = {
        // Missing required fields
      };

      // Act & Assert
      await expect(service.create(invalid{{ServiceName}}Data)).rejects.toThrow(ValidationError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictError for duplicate {{serviceName}}', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(created{{ServiceName}});

      // Act & Assert
      await expect(service.create(valid{{ServiceName}}Data)).rejects.toThrow(ConflictError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should publish {{ServiceName}}CreatedEvent after creation', async () => {
      // Arrange
      mockRepository.create.mockResolvedValue(created{{ServiceName}});

      // Act
      await service.create(valid{{ServiceName}}Data);

      // Assert
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: '{{serviceName}}.created',
          data: expect.objectContaining({
            {{serviceName}}Id: created{{ServiceName}}.id
          })
        })
      );
    });

    it('should rollback transaction on error', async () => {
      // Arrange
      const error = new Error('Database error');
      mockRepository.create.mockRejectedValue(error);

      // Act & Assert
      await expect(service.create(valid{{ServiceName}}Data)).rejects.toThrow(error);
      expect(mockUow.executeTransaction).toHaveBeenCalled();
    });
  });

  // ========== READ TESTS ==========

  describe('findById', () => {
    const {{serviceName}}Id = '{{id}}';
    const found{{ServiceName}} = {
      id: {{serviceName}}Id,
      {{field}}: '{{value}}',
      createdAt: new Date()
    };

    it('should return {{serviceName}} when found', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(found{{ServiceName}});

      // Act
      const result = await service.findById({{serviceName}}Id);

      // Assert
      expect(result).toEqual(found{{ServiceName}});
      expect(mockRepository.findById).toHaveBeenCalledWith({{serviceName}}Id);
    });

    it('should return null when not found', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await service.findById('nonexistent');

      // Assert
      expect(result).toBeNull();
    });

    it('should throw NotFoundError when throwIfNotFound is true', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById('nonexistent', true)).rejects.toThrow(NotFoundError);
    });

    it('should log debug message when finding {{serviceName}}', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(found{{ServiceName}});

      // Act
      await service.findById({{serviceName}}Id);

      // Assert
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Finding'),
        expect.any(Object)
      );
    });
  });

  describe('findAll', () => {
    const {{serviceName}}List = [
      { id: '1', {{field}}: '{{value}}1' },
      { id: '2', {{field}}: '{{value}}2' }
    ];

    it('should return all {{serviceName}}s', async () => {
      // Arrange
      mockRepository.findAll.mockResolvedValue({{serviceName}}List);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual({{serviceName}}List);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it('should return filtered {{serviceName}}s when filters provided', async () => {
      // Arrange
      const filters = { active: true };
      mockRepository.findAll.mockResolvedValue([{{serviceName}}List[0]]);

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return empty array when no {{serviceName}}s found', async () => {
      // Arrange
      mockRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  // ========== UPDATE TESTS ==========

  describe('update', () => {
    const {{serviceName}}Id = '{{id}}';
    const existing{{ServiceName}} = {
      id: {{serviceName}}Id,
      {{field}}: 'old-{{value}}',
      createdAt: new Date()
    };

    const update{{ServiceName}}Data = {
      {{field}}: 'new-{{value}}'
    };

    const updated{{ServiceName}} = {
      ...existing{{ServiceName}},
      ...update{{ServiceName}}Data,
      updatedAt: new Date()
    };

    it('should update {{serviceName}} with valid data', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(existing{{ServiceName}});
      mockRepository.update.mockResolvedValue(updated{{ServiceName}});

      // Act
      const result = await service.update({{serviceName}}Id, update{{ServiceName}}Data);

      // Assert
      expect(result).toEqual(updated{{ServiceName}});
      expect(mockRepository.update).toHaveBeenCalledWith({{serviceName}}Id, update{{ServiceName}}Data);
      expect(mockEventBus.publish).toHaveBeenCalled();
    });

    it('should throw NotFoundError when {{serviceName}} does not exist', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update('nonexistent', update{{ServiceName}}Data)).rejects.toThrow(NotFoundError);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for invalid update data', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(existing{{ServiceName}});
      const invalidUpdate{{ServiceName}}Data = {
        {{field}}: '' // Invalid value
      };

      // Act & Assert
      await expect(service.update({{serviceName}}Id, invalidUpdate{{ServiceName}}Data)).rejects.toThrow(ValidationError);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should publish {{ServiceName}}UpdatedEvent after update', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(existing{{ServiceName}});
      mockRepository.update.mockResolvedValue(updated{{ServiceName}});

      // Act
      await service.update({{serviceName}}Id, update{{ServiceName}}Data);

      // Assert
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: '{{serviceName}}.updated',
          data: expect.objectContaining({
            {{serviceName}}Id: {{serviceName}}Id
          })
        })
      );
    });
  });

  // ========== DELETE TESTS ==========

  describe('delete', () => {
    const {{serviceName}}Id = '{{id}}';
    const existing{{ServiceName}} = {
      id: {{serviceName}}Id,
      {{field}}: '{{value}}'
    };

    it('should delete {{serviceName}} when it exists', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(existing{{ServiceName}});
      mockRepository.delete.mockResolvedValue(undefined);

      // Act
      await service.delete({{serviceName}}Id);

      // Assert
      expect(mockRepository.delete).toHaveBeenCalledWith({{serviceName}}Id);
      expect(mockEventBus.publish).toHaveBeenCalled();
    });

    it('should throw NotFoundError when {{serviceName}} does not exist', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundError);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when deletion is not allowed', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue({
        ...existing{{ServiceName}},
        hasActiveRelations: true
      });

      // Act & Assert
      await expect(service.delete({{serviceName}}Id)).rejects.toThrow(ValidationError);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should publish {{ServiceName}}DeletedEvent after deletion', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(existing{{ServiceName}});
      mockRepository.delete.mockResolvedValue(undefined);

      // Act
      await service.delete({{serviceName}}Id);

      // Assert
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: '{{serviceName}}.deleted',
          data: expect.objectContaining({
            {{serviceName}}Id: {{serviceName}}Id
          })
        })
      );
    });
  });

  // ========== UTILITY TESTS ==========

  describe('count', () => {
    it('should return count of {{serviceName}}s', async () => {
      // Arrange
      mockRepository.count.mockResolvedValue(10);

      // Act
      const result = await service.count();

      // Assert
      expect(result).toBe(10);
      expect(mockRepository.count).toHaveBeenCalled();
    });

    it('should return filtered count when filters provided', async () => {
      // Arrange
      const filters = { active: true };
      mockRepository.count.mockResolvedValue(5);

      // Act
      const result = await service.count(filters);

      // Assert
      expect(result).toBe(5);
      expect(mockRepository.count).toHaveBeenCalledWith(filters);
    });
  });

  describe('exists', () => {
    it('should return true when {{serviceName}} exists', async () => {
      // Arrange
      mockRepository.exists.mockResolvedValue(true);

      // Act
      const result = await service.exists('{{id}}');

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when {{serviceName}} does not exist', async () => {
      // Arrange
      mockRepository.exists.mockResolvedValue(false);

      // Act
      const result = await service.exists('nonexistent');

      // Assert
      expect(result).toBe(false);
    });
  });

  // ========== CUSTOM METHOD TESTS ==========
  // Add tests for your custom service methods here

  /*
  describe('customMethod', () => {
    it('should perform custom operation', async () => {
      // Arrange
      // ...

      // Act
      // ...

      // Assert
      // ...
    });
  });
  */
});

/**
 * Test Utilities
 */

/**
 * Create mock logger for testing
 */
function createMockLogger() {
  return {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
}

/**
 * Wait for async operations to complete
 */
async function wait(ms: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Flush promises
 */
async function flushPromises(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}
