import { EntityType } from './crm-types';

/**
 * Sync Operation Types
 */

export interface SyncOperation {
  id: string;
  entityType: EntityType;
  entityId: string;
  operation: SyncOperationType;
  direction: SyncDirection;
  status: SyncStatus;
  sourceData?: any;
  targetData?: any;
  error?: string;
  retryCount: number;
  timestamp: Date;
  completedAt?: Date;
}

export enum SyncOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete'
}

export enum SyncDirection {
  TO_CRM = 'to_crm',
  FROM_CRM = 'from_crm',
  BIDIRECTIONAL = 'bidirectional'
}

export enum SyncStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUCCESS = 'success',
  FAILED = 'failed',
  CONFLICT = 'conflict'
}

export interface SyncResult {
  operation: SyncOperation;
  success: boolean;
  error?: Error;
  conflictResolution?: ConflictResolution;
}

export interface ConflictResolution {
  strategy: ConflictStrategy;
  resolvedData: any;
  originalData: any;
  incomingData: any;
  timestamp: Date;
}

export enum ConflictStrategy {
  TIMESTAMP_WINS = 'timestamp_wins',
  SOURCE_WINS = 'source_wins',
  TARGET_WINS = 'target_wins',
  MANUAL_REVIEW = 'manual_review',
  MERGE = 'merge'
}

export interface SyncHealthMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  conflictOperations: number;
  averageProcessingTime: number;
  lastSyncTime: Date;
  entityMetrics: Record<EntityType, EntitySyncMetrics>;
}

export interface EntitySyncMetrics {
  entityType: EntityType;
  totalSynced: number;
  successRate: number;
  averageProcessingTime: number;
  lastSyncTime: Date;
  errors: SyncError[];
}

export interface SyncError {
  id: string;
  entityType: EntityType;
  entityId: string;
  error: string;
  timestamp: Date;
  retryCount: number;
  resolved: boolean;
}

export interface SyncConfiguration {
  batchSize: number;
  maxRetryAttempts: number;
  retryDelayMs: number;
  conflictStrategy: ConflictStrategy;
  enabledEntities: EntityType[];
  syncIntervalMinutes: number;
  webhookEnabled: boolean;
}

export interface TransformationMapping {
  sourceField: string;
  targetField: string;
  transform?: (value: any) => any;
  required?: boolean;
  defaultValue?: any;
}
