import dotenv from 'dotenv';
import { ConflictStrategy } from '../types/sync-types';

dotenv.config();

export const config = {
  twentyCRM: {
    apiUrl: process.env.TWENTYCRM_API_URL || 'https://api.twenty.com/v1',
    apiKey: process.env.TWENTYCRM_API_KEY || '',
    webhookSecret: process.env.TWENTYCRM_WEBHOOK_SECRET || ''
  },
  sync: {
    intervalMinutes: parseInt(process.env.SYNC_INTERVAL_MINUTES || '15', 10),
    batchSize: parseInt(process.env.SYNC_BATCH_SIZE || '100', 10),
    maxRetryAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3', 10),
    retryDelayMs: parseInt(process.env.RETRY_DELAY_MS || '1000', 10),
    conflictStrategy: (process.env.CONFLICT_STRATEGY as ConflictStrategy) || ConflictStrategy.TIMESTAMP_WINS
  },
  health: {
    checkIntervalMinutes: parseInt(process.env.HEALTH_CHECK_INTERVAL_MINUTES || '5', 10),
    alertEmail: process.env.ALERT_EMAIL || ''
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development'
  }
};

export default config;
