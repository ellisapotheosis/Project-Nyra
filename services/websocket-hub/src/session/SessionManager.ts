import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { SessionData } from '../types';
import { config } from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('session-manager');

export class SessionManager {
  private sessions = new Map<string, SessionData>();
  private userSessions = new Map<string, Set<string>>();

  createSession(ws: WebSocket, userId?: string, permissions: string[] = []): string {
    const sessionId = uuidv4();

    // Check max connections per user
    if (userId) {
      const userSessionCount = this.userSessions.get(userId)?.size || 0;
      if (userSessionCount >= config.maxConnectionsPerUser) {
        throw new Error('Maximum connections per user exceeded');
      }
    }

    const session: SessionData = {
      ws,
      userId,
      sessionId,
      permissions,
      createdAt: new Date(),
      lastActivity: new Date(),
      subscriptions: new Set(),
      metadata: {},
    };

    this.sessions.set(sessionId, session);

    if (userId) {
      if (!this.userSessions.has(userId)) {
        this.userSessions.set(userId, new Set());
      }
      this.userSessions.get(userId)!.add(sessionId);
    }

    logger.info({ sessionId, userId }, 'Session created');
    return sessionId;
  }

  getSession(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId);
  }

  updateActivity(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
    }
  }

  subscribe(sessionId: string, channel: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.subscriptions.add(channel);
      logger.debug({ sessionId, channel }, 'Subscribed to channel');
    }
  }

  unsubscribe(sessionId: string, channel: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.subscriptions.delete(channel);
      logger.debug({ sessionId, channel }, 'Unsubscribed from channel');
    }
  }

  getSubscriptions(sessionId: string): Set<string> {
    const session = this.sessions.get(sessionId);
    return session ? session.subscriptions : new Set();
  }

  deleteSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Remove from user sessions
      if (session.userId) {
        const userSessions = this.userSessions.get(session.userId);
        if (userSessions) {
          userSessions.delete(sessionId);
          if (userSessions.size === 0) {
            this.userSessions.delete(session.userId);
          }
        }
      }

      this.sessions.delete(sessionId);
      logger.info({ sessionId, userId: session.userId }, 'Session deleted');
    }
  }

  getAllSessions(): SessionData[] {
    return Array.from(this.sessions.values());
  }

  getActiveSessions(): number {
    return this.sessions.size;
  }

  getUserSessions(userId: string): SessionData[] {
    const sessionIds = this.userSessions.get(userId);
    if (!sessionIds) return [];

    return Array.from(sessionIds)
      .map(id => this.sessions.get(id))
      .filter((s): s is SessionData => s !== undefined);
  }

  cleanupStale() {
    const now = Date.now();
    const timeout = config.sessionTimeout * 1000;

    for (const [sessionId, session] of this.sessions) {
      if (now - session.lastActivity.getTime() > timeout) {
        logger.info({ sessionId }, 'Cleaning up stale session');
        this.deleteSession(sessionId);
      }
    }
  }

  startCleanupTimer() {
    setInterval(() => {
      this.cleanupStale();
    }, config.healthCheckInterval);

    logger.info('Session cleanup timer started');
  }
}
