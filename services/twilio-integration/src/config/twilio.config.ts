import { config } from 'dotenv';
import { TwilioConfig } from '../types/twilio.types';

config();

export const twilioConfig: TwilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || '',
  authToken: process.env.TWILIO_AUTH_TOKEN || '',
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  apiKey: process.env.TWILIO_API_KEY,
  apiSecret: process.env.TWILIO_API_SECRET,
};

export const serverConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',
  webhookBaseUrl: process.env.WEBHOOK_BASE_URL || 'http://localhost:3000',
};

export const databaseConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/twilio-integration',
};

export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
};

export const pricingConfig = {
  voice: {
    perMinute: 0.013, // USD per minute
    recording: 0.0025, // USD per minute
  },
  sms: {
    perMessage: 0.0075, // USD per message
    mms: 0.02, // USD per MMS
  },
  phoneNumber: {
    monthly: 1.0, // USD per month
  },
};

export function validateConfig(): void {
  const required = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
