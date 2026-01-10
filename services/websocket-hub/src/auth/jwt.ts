import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthToken } from '../types';
import { createLogger } from '../utils/logger';

const logger = createLogger('jwt');

export class JWTAuth {
  private readonly secret: string;

  constructor(secret?: string) {
    this.secret = secret || config.jwtSecret;
  }

  verify(token: string): AuthToken | null {
    try {
      const decoded = jwt.verify(token, this.secret) as AuthToken;
      return decoded;
    } catch (error) {
      logger.warn({ error }, 'JWT verification failed');
      return null;
    }
  }

  sign(payload: Omit<AuthToken, 'exp' | 'iat'>): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: config.sessionTimeout,
    });
  }

  extractFromRequest(req: any): string | null {
    // From query string: ws://localhost:8080?token=xxx
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    if (token) return token;

    // From Authorization header
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      return auth.substring(7);
    }

    return null;
  }
}
