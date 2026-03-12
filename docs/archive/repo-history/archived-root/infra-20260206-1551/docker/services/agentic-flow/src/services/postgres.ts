/**
 * PostgreSQL Service - Database initialization
 */

import pg from 'pg';
import type { Logger } from 'pino';
import { config } from '../config/index.js';

const { Pool } = pg;

export async function initializePostgres(logger: Logger): Promise<pg.Pool> {
  try {
    logger.info(`Connecting to PostgreSQL: ${config.databaseUrl.replace(/:[^:@]+@/, ':***@')}`);

    const pool = new Pool({
      connectionString: config.databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    logger.info('PostgreSQL connected successfully');
    return pool;
  } catch (error) {
    logger.error({ error }, 'Failed to connect to PostgreSQL');
    throw error;
  }
}
