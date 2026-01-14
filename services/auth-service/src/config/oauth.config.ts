import dotenv from 'dotenv';

dotenv.config();

export const oauthConfig = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/oauth/google/callback',
    scope: ['profile', 'email']
  },

  microsoft: {
    clientID: process.env.MICROSOFT_CLIENT_ID || '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
    callbackURL: process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:3000/api/auth/oauth/microsoft/callback',
    scope: ['user.read'],
    tenant: 'common'
  },

  successRedirect: process.env.FRONTEND_URL || 'http://localhost:3001',
  failureRedirect: process.env.FRONTEND_URL + '/login?error=oauth_failed' || 'http://localhost:3001/login?error=oauth_failed'
};

export default oauthConfig;
