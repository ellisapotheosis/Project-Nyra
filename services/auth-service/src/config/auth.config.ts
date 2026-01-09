import dotenv from 'dotenv';

dotenv.config();

export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-this',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-this',
    expiry: process.env.JWT_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    issuer: 'auth-service',
    audience: 'nyra-app'
  },

  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10)
  },

  passwordReset: {
    expiry: process.env.PASSWORD_RESET_EXPIRY || '1h',
    tokenLength: 32
  },

  mfa: {
    issuer: process.env.MFA_ISSUER || 'NyraApp',
    window: 2,
    backupCodesCount: 10
  },

  apiKey: {
    expiry: process.env.API_KEY_EXPIRY || '90d',
    keyLength: 32
  },

  session: {
    maxActiveSessions: 5,
    cleanupInterval: 3600000 // 1 hour
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

    auth: {
      windowMs: 900000, // 15 minutes
      maxRequests: 5 // 5 login attempts per 15 minutes
    },

    registration: {
      windowMs: 3600000, // 1 hour
      maxRequests: 3 // 3 registrations per hour
    }
  },

  security: {
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true
  }
};

export default authConfig;
