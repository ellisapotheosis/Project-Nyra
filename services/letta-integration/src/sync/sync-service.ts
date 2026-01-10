/**
 * Memory Synchronization Service
 * Keeps local and remote memory in sync
 */

import { EventEmitter } from 'events';
import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { LettaClient } from '../client/letta-client';
import { MemoryStore } from '../memory/memory-store';
import { Memory, SyncStatus } from '../types';
import { Logger } from '../utils/logger';

export class SyncService extends EventEmitter {
  private logger: Logger;
  private client: LettaClient;
  private store: MemoryStore;
  private queue: Queue;
  private worker: Worker;
  private redis: Redis;
  private status: SyncStatus;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(client: LettaClient, store: MemoryStore) {
    super();
    this.logger = new Logger('SyncService');
    this.client = client;
    this.store = store;

    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: null,
    });

    this.queue = new Queue('memory-sync', { connection: this.redis });

    this.worker = new Worker(
      'memory-sync',
      async (job: Job) => this.processSyncJob(job),
      { connection: this.redis }
    );

    this.status = {
      lastSync: new Date(0),
      status: 'idle',
      pendingChanges: 0,
      conflicts: 0,
    };

    this.setupWorkerHandlers();
  }

  private setupWorkerHandlers(): void {
    this.worker.on('completed', (job) => {
      this.logger.info('Sync job completed:', { jobId: job.id });
    });

    this.worker.on('failed', (job, error) => {
      this.logger.error('Sync job failed:', { jobId: job?.id, error });
    });
  }

  async start(intervalMs = 60000): Promise<void> {
    this.logger.info('Starting sync service:', { intervalMs });

    // Initial sync
    await this.sync();

    // Schedule periodic sync
    this.syncInterval = setInterval(() => {
      this.sync().catch(error => {
        this.logger.error('Scheduled sync failed:', error);
      });
    }, intervalMs);
  }

  async stop(): Promise<void> {
    this.logger.info('Stopping sync service');

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    await this.worker.close();
    await this.queue.close();
    await this.redis.quit();
  }

  async sync(): Promise<void> {
    try {
      this.status.status = 'syncing';
      this.logger.info('Starting sync');

      // Queue sync job
      await this.queue.add('full-sync', {
        timestamp: new Date().toISOString(),
      });

      this.emit('syncStarted');
    } catch (error) {
      this.status.status = 'error';
      this.logger.error('Sync failed:', error);
      this.emit('syncFailed', error);
      throw error;
    }
  }

  private async processSyncJob(job: Job): Promise<void> {
    try {
      // Get local memories
      const localMemories = await this.getAllLocalMemories();

      // Get remote memories
      const remoteMemories = await this.getAllRemoteMemories();

      // Find differences
      const { toUpload, toDownload, conflicts } = this.findDifferences(
        localMemories,
        remoteMemories
      );

      // Upload new local memories
      for (const memory of toUpload) {
        await this.client.createMemory(memory);
      }

      // Download new remote memories
      for (const memory of toDownload) {
        await this.store.saveMemory(memory);
      }

      // Handle conflicts
      for (const conflict of conflicts) {
        await this.resolveConflict(conflict.local, conflict.remote);
      }

      // Update status
      this.status = {
        lastSync: new Date(),
        status: 'idle',
        pendingChanges: 0,
        conflicts: conflicts.length,
      };

      this.logger.info('Sync completed:', {
        uploaded: toUpload.length,
        downloaded: toDownload.length,
        conflicts: conflicts.length,
      });

      this.emit('syncCompleted', {
        uploaded: toUpload.length,
        downloaded: toDownload.length,
        conflicts: conflicts.length,
      });
    } catch (error) {
      this.status.status = 'error';
      throw error;
    }
  }

  private async getAllLocalMemories(): Promise<Memory[]> {
    // This would need to be implemented to get all agents' memories
    // For now, just return empty array
    return [];
  }

  private async getAllRemoteMemories(): Promise<Memory[]> {
    // This would need to be implemented to paginate through all memories
    // For now, just return empty array
    return [];
  }

  private findDifferences(
    local: Memory[],
    remote: Memory[]
  ): {
    toUpload: Memory[];
    toDownload: Memory[];
    conflicts: Array<{ local: Memory; remote: Memory }>;
  } {
    const localMap = new Map(local.map(m => [m.id, m]));
    const remoteMap = new Map(remote.map(m => [m.id, m]));

    const toUpload: Memory[] = [];
    const toDownload: Memory[] = [];
    const conflicts: Array<{ local: Memory; remote: Memory }> = [];

    // Find memories to upload
    for (const memory of local) {
      if (!remoteMap.has(memory.id)) {
        toUpload.push(memory);
      } else {
        const remoteMemory = remoteMap.get(memory.id)!;
        if (this.hasConflict(memory, remoteMemory)) {
          conflicts.push({ local: memory, remote: remoteMemory });
        }
      }
    }

    // Find memories to download
    for (const memory of remote) {
      if (!localMap.has(memory.id)) {
        toDownload.push(memory);
      }
    }

    return { toUpload, toDownload, conflicts };
  }

  private hasConflict(local: Memory, remote: Memory): boolean {
    // Check if timestamps differ significantly
    const localTime = new Date(local.timestamp).getTime();
    const remoteTime = new Date(remote.timestamp).getTime();

    return Math.abs(localTime - remoteTime) > 1000 && local.content !== remote.content;
  }

  private async resolveConflict(local: Memory, remote: Memory): Promise<void> {
    // Simple conflict resolution: prefer newer memory
    const localTime = new Date(local.timestamp).getTime();
    const remoteTime = new Date(remote.timestamp).getTime();

    if (localTime > remoteTime) {
      // Upload local version
      await this.client.updateMemory(local.id, local);
      this.logger.info('Conflict resolved: kept local version', { id: local.id });
    } else {
      // Download remote version
      await this.store.saveMemory(remote);
      this.logger.info('Conflict resolved: kept remote version', { id: remote.id });
    }
  }

  getStatus(): SyncStatus {
    return { ...this.status };
  }

  async forceSyncMemory(memory: Memory): Promise<void> {
    try {
      await this.client.createMemory(memory);
      this.logger.info('Memory force synced:', { id: memory.id });
    } catch (error) {
      this.logger.error('Force sync failed:', error);
      throw error;
    }
  }
}
