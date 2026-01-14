/**
 * Vector Index Manager
 * Manages index lifecycle, optimization, and metadata
 */

import pino from 'pino';
import { QdrantService } from './qdrant-client';
import { IndexConfig, IndexStats, QdrantPoint } from '../types';

const logger = pino({ name: 'index-manager' });

export class IndexManager {
  private indexMetadata: Map<string, IndexConfig> = new Map();

  constructor(private qdrantService: QdrantService) {}

  async createIndex(config: IndexConfig): Promise<void> {
    const exists = await this.qdrantService.collectionExists(config.name);

    if (exists) {
      logger.warn({ index: config.name }, 'Index already exists');
      throw new Error(`Index ${config.name} already exists`);
    }

    // Set defaults
    const fullConfig: IndexConfig = {
      ...config,
      metric: config.metric || 'cosine',
      onDisk: config.onDisk !== undefined ? config.onDisk : false,
      hnswConfig: {
        m: config.hnswConfig?.m || 16,
        efConstruct: config.hnswConfig?.efConstruct || 100,
        fullScanThreshold: config.hnswConfig?.fullScanThreshold || 10000,
      },
      optimizerConfig: {
        deletedThreshold: config.optimizerConfig?.deletedThreshold || 0.2,
        vacuumMinVectorNumber: config.optimizerConfig?.vacuumMinVectorNumber || 1000,
        defaultSegmentNumber: config.optimizerConfig?.defaultSegmentNumber || 0,
      },
    };

    await this.qdrantService.createCollection(fullConfig);
    this.indexMetadata.set(config.name, fullConfig);

    logger.info({ index: config.name, config: fullConfig }, 'Index created');
  }

  async deleteIndex(indexName: string): Promise<void> {
    await this.qdrantService.deleteCollection(indexName);
    this.indexMetadata.delete(indexName);
    logger.info({ index: indexName }, 'Index deleted');
  }

  async getIndexStats(indexName: string): Promise<IndexStats> {
    const info = await this.qdrantService.getCollectionInfo(indexName);

    return {
      name: indexName,
      vectorCount: info.points_count || 0,
      dimensions: info.config?.params?.vectors?.size || 0,
      indexedVectorsCount: info.indexed_vectors_count || 0,
      pointsCount: info.points_count || 0,
      segmentsCount: info.segments_count || 0,
      status: info.status,
      optimizerStatus: info.optimizer_status?.status,
    };
  }

  async listIndices(): Promise<string[]> {
    const collections = await this.qdrantService.getClient_Raw().getCollections();
    return collections.collections.map(c => c.name);
  }

  async indexExists(indexName: string): Promise<boolean> {
    return await this.qdrantService.collectionExists(indexName);
  }

  async addVectors(
    indexName: string,
    vectors: QdrantPoint[],
    batchSize = 100
  ): Promise<void> {
    logger.info({
      index: indexName,
      count: vectors.length
    }, 'Adding vectors to index');

    await this.qdrantService.upsertPoints(indexName, vectors, {
      wait: true,
      batch: true,
    });
  }

  async updateVector(
    indexName: string,
    id: string | number,
    vector: number[],
    metadata?: Record<string, any>
  ): Promise<void> {
    const point: QdrantPoint = {
      id,
      vector,
      payload: metadata,
    };

    await this.qdrantService.upsertPoints(indexName, [point], { wait: true });
  }

  async deleteVector(indexName: string, id: string | number): Promise<void> {
    await this.qdrantService.deletePoints(indexName, [id]);
  }

  async deleteVectors(indexName: string, ids: (string | number)[]): Promise<void> {
    await this.qdrantService.deletePoints(indexName, ids);
  }

  async optimizeIndex(indexName: string): Promise<void> {
    logger.info({ index: indexName }, 'Optimizing index');

    // Trigger optimization by creating and deleting a dummy point
    const tempId = `optimize-${Date.now()}`;
    const stats = await this.getIndexStats(indexName);

    const dummyVector = new Array(stats.dimensions).fill(0);
    await this.addVectors(indexName, [{
      id: tempId,
      vector: dummyVector,
      payload: { _temp: true },
    }]);

    await this.deleteVector(indexName, tempId);

    logger.info({ index: indexName }, 'Index optimization triggered');
  }

  async createSnapshot(indexName: string): Promise<string> {
    const snapshotName = await this.qdrantService.createSnapshot(indexName);
    logger.info({ index: indexName, snapshot: snapshotName }, 'Snapshot created');
    return snapshotName;
  }

  async getVectorCount(indexName: string): Promise<number> {
    return await this.qdrantService.count(indexName);
  }

  async updateMetadata(
    indexName: string,
    id: string | number,
    metadata: Record<string, any>
  ): Promise<void> {
    await this.qdrantService.updatePayload(indexName, [id], metadata);
  }

  getIndexConfig(indexName: string): IndexConfig | undefined {
    return this.indexMetadata.get(indexName);
  }
}
