/**
 * Qdrant Client with Connection Pooling
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import pino from 'pino';
import {
  QdrantPoint,
  QdrantSearchParams,
  QdrantSearchResponse,
  IndexConfig
} from '../types';

const logger = pino({ name: 'qdrant-client' });

export class QdrantService {
  private client: QdrantClient;
  private connectionPool: QdrantClient[] = [];
  private currentClientIndex = 0;

  constructor(
    private config: {
      url: string;
      apiKey?: string;
      timeout?: number;
      poolSize?: number;
    }
  ) {
    // Primary client
    this.client = new QdrantClient({
      url: config.url,
      apiKey: config.apiKey,
      timeout: config.timeout || 30000,
    });

    // Initialize connection pool
    const poolSize = config.poolSize || 5;
    for (let i = 0; i < poolSize; i++) {
      this.connectionPool.push(
        new QdrantClient({
          url: config.url,
          apiKey: config.apiKey,
          timeout: config.timeout || 30000,
        })
      );
    }

    logger.info({ poolSize, url: config.url }, 'Qdrant client initialized');
  }

  private getClient(): QdrantClient {
    // Round-robin load balancing
    const client = this.connectionPool[this.currentClientIndex];
    this.currentClientIndex = (this.currentClientIndex + 1) % this.connectionPool.length;
    return client;
  }

  async createCollection(config: IndexConfig): Promise<void> {
    logger.info({ collection: config.name }, 'Creating collection');

    await this.client.createCollection(config.name, {
      vectors: {
        size: config.dimensions,
        distance: config.metric === 'cosine' ? 'Cosine' :
                 config.metric === 'euclidean' ? 'Euclid' : 'Dot',
      },
      optimizers_config: config.optimizerConfig,
      hnsw_config: config.hnswConfig,
      on_disk: config.onDisk,
    });

    logger.info({ collection: config.name }, 'Collection created');
  }

  async collectionExists(collectionName: string): Promise<boolean> {
    try {
      const collections = await this.client.getCollections();
      return collections.collections.some(c => c.name === collectionName);
    } catch (error) {
      logger.error({ error, collection: collectionName }, 'Error checking collection');
      return false;
    }
  }

  async deleteCollection(collectionName: string): Promise<void> {
    logger.info({ collection: collectionName }, 'Deleting collection');
    await this.client.deleteCollection(collectionName);
  }

  async getCollectionInfo(collectionName: string): Promise<any> {
    return await this.client.getCollection(collectionName);
  }

  async upsertPoints(
    collectionName: string,
    points: QdrantPoint[],
    options?: { wait?: boolean; batch?: boolean }
  ): Promise<void> {
    const client = this.getClient();
    const wait = options?.wait !== false;
    const batch = options?.batch !== false;

    if (batch && points.length > 100) {
      // Batch insert for large datasets
      const batchSize = 100;
      for (let i = 0; i < points.length; i += batchSize) {
        const chunk = points.slice(i, i + batchSize);
        await client.upsert(collectionName, {
          wait,
          points: chunk,
        });
        logger.debug({
          progress: `${i + chunk.length}/${points.length}`
        }, 'Batch upsert progress');
      }
    } else {
      await client.upsert(collectionName, {
        wait,
        points,
      });
    }

    logger.info({
      collection: collectionName,
      count: points.length
    }, 'Points upserted');
  }

  async search(
    collectionName: string,
    params: QdrantSearchParams
  ): Promise<QdrantSearchResponse[]> {
    const client = this.getClient();

    const results = await client.search(collectionName, {
      vector: params.vector as number[],
      limit: params.limit || 10,
      offset: params.offset || 0,
      filter: params.filter,
      with_payload: params.with_payload !== false,
      with_vector: params.with_vector || false,
      score_threshold: params.score_threshold,
    });

    return results as QdrantSearchResponse[];
  }

  async scroll(
    collectionName: string,
    options?: {
      limit?: number;
      offset?: string | number;
      filter?: any;
      with_payload?: boolean;
      with_vector?: boolean;
    }
  ): Promise<{ points: QdrantPoint[]; next_page_offset?: string | number }> {
    const client = this.getClient();

    const result = await client.scroll(collectionName, {
      limit: options?.limit || 100,
      offset: options?.offset,
      filter: options?.filter,
      with_payload: options?.with_payload !== false,
      with_vector: options?.with_vector || false,
    });

    return {
      points: result.points as QdrantPoint[],
      next_page_offset: result.next_page_offset,
    };
  }

  async count(collectionName: string, filter?: any): Promise<number> {
    const result = await this.client.count(collectionName, {
      filter,
      exact: true,
    });

    return result.count;
  }

  async deletePoints(
    collectionName: string,
    pointIds: (string | number)[],
    wait = true
  ): Promise<void> {
    await this.client.delete(collectionName, {
      wait,
      points: pointIds,
    });

    logger.info({
      collection: collectionName,
      count: pointIds.length
    }, 'Points deleted');
  }

  async updatePayload(
    collectionName: string,
    pointIds: (string | number)[],
    payload: Record<string, any>,
    wait = true
  ): Promise<void> {
    await this.client.setPayload(collectionName, {
      wait,
      points: pointIds,
      payload,
    });
  }

  async createSnapshot(collectionName: string): Promise<string> {
    const result = await this.client.createSnapshot(collectionName);
    logger.info({ collection: collectionName, snapshot: result.name }, 'Snapshot created');
    return result.name;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.getCollections();
      return true;
    } catch (error) {
      logger.error({ error }, 'Health check failed');
      return false;
    }
  }

  getClient_Raw(): QdrantClient {
    return this.client;
  }
}
