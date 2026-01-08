import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8020', 10),

  database: {
    url: process.env.DATABASE_URL || 'postgresql://twenty:twenty@localhost:5432/twenty'
  },

  n8n: {
    baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
    apiKey: process.env.N8N_API_KEY || '',
    webhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/nyra/dispatch'
  },

  activepieces: {
    baseUrl: process.env.ACTIVEPIECES_BASE_URL || 'http://localhost:8080',
    apiKey: process.env.ACTIVEPIECES_API_KEY || ''
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/campaign-engine.log'
  },

  campaign: {
    timezone: process.env.CAMPAIGN_TIMEZONE || 'America/Los_Angeles',
    maxRetries: parseInt(process.env.CAMPAIGN_MAX_RETRIES || '3', 10),
    retryDelayMinutes: parseInt(process.env.CAMPAIGN_RETRY_DELAY_MINUTES || '30', 10)
  },

  compliance: {
    enableGuardrails: process.env.ENABLE_GUARDRAILS === 'true',
    dncCheckEnabled: process.env.DNC_CHECK_ENABLED === 'true',
    consentRequired: process.env.CONSENT_REQUIRED === 'true'
  }
};
