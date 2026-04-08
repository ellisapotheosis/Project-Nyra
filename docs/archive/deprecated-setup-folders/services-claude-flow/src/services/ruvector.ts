/**
 * RuVector Service - Vector storage and neural pattern matching
 */

import pg from 'pg';
import type { Logger } from 'pino';
import type { Config } from '../config/index.js';

const { Pool } = pg;

export interface RuvectorClient extends pg.Pool {}

export async function initializeRuvector(config: Config, logger: Logger): Promise<RuvectorClient | null> {
  if (!config.enableRuvector || !config.ruvectorPassword) {
    logger.warn('RuVector not enabled or not configured');
    return null;
  }

  try {
    const pool = new Pool({
      host: config.ruvectorHost,
      port: config.ruvectorPort,
      user: config.ruvectorUser,
      password: config.ruvectorPassword,
      database: config.ruvectorDatabase,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    // Test connection
    const client = await pool.connect();
    
    // Check if ruvector extension is available
    try {
      await client.query('SELECT ruvector_version()');
      logger.info('RuVector extension detected');
    } catch {
      logger.warn('RuVector extension not available, using basic pgvector');
    }
    
    client.release();
    logger.info('RuVector connection established');

    return pool;
  } catch (error) {
    logger.error({ error }, 'Failed to connect to RuVector');
    return null;
  }
}

/**
 * Search for similar vectors in RuVector
 */
export async function searchVectors(
  pool: RuvectorClient,
  embedding: number[],
  limit: number = 10,
  namespace?: string
): Promise<Array<{ id: string; content: string; similarity: number }>> {
  const query = `
    SELECT id, content, 1 - (embedding <=> $1::vector) as similarity
    FROM memory_vectors
    ${namespace ? 'WHERE namespace = $3' : ''}
    ORDER BY embedding <=> $1::vector
    LIMIT $2
  `;

  const params = namespace 
    ? [`[${embedding.join(',')}]`, limit, namespace]
    : [`[${embedding.join(',')}]`, limit];

  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Store a vector in RuVector
 */
export async function storeVector(
  pool: RuvectorClient,
  id: string,
  content: string,
  embedding: number[],
  namespace: string = 'default',
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const query = `
    INSERT INTO memory_vectors (id, namespace, content, embedding, metadata, created_at)
    VALUES ($1, $2, $3, $4::vector, $5, NOW())
    ON CONFLICT (id) DO UPDATE SET
      content = EXCLUDED.content,
      embedding = EXCLUDED.embedding,
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
  `;

  await pool.query(query, [
    id,
    namespace,
    content,
    `[${embedding.join(',')}]`,
    JSON.stringify(metadata),
  ]);
}
