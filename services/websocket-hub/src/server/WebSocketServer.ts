import { WebSocketServer as WSServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { SessionManager } from '../session/SessionManager';
import { JWTAuth } from '../auth/jwt';
import { RateLimiter } from '../middleware/rateLimiter';
import { EventBus } from '../events/EventBus';
import { MetricsCollector } from '../metrics/prometheus';
import { NexusIntegration } from '../integrations/NexusIntegration';
import { ClientMessage, ServerMessage, SystemEvent } from '../types';
import { config } from '../config';
import { createLogger } from '../utils/logger';
import Redis from 'ioredis';

const logger = createLogger('websocket-server');

export class WebSocketServer {
  private wss: WSServer;
  private sessionManager: SessionManager;
  private jwtAuth: JWTAuth;
  private rateLimiter: RateLimiter;
  private eventBus: EventBus;
  private metrics: MetricsCollector;
  private nexusIntegration: NexusIntegration;
  private redis?: Redis;

  constructor(port?: number) {
    // Initialize Redis if enabled
    if (config.redisEnabled && config.redisUrl) {
      this.redis = new Redis(config.redisUrl);
      logger.info('Redis connection established');
    }

    // Initialize components
    this.sessionManager = new SessionManager();
    this.jwtAuth = new JWTAuth();
    this.rateLimiter = new RateLimiter(this.redis);
    this.eventBus = new EventBus();
    this.metrics = new MetricsCollector();
    this.nexusIntegration = new NexusIntegration(this.eventBus);

    // Create WebSocket server
    this.wss = new WSServer({
      port: port || config.port,
      perMessageDeflate: {
        zlibDeflateOptions: {
          chunkSize: 1024,
          memLevel: 7,
          level: 3
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024
      }
    });

    this.setupEventHandlers();
    this.setupSystemEventHandlers();
  }

  private setupEventHandlers() {
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      this.handleConnection(ws, req);
    });

    this.wss.on('error', (error) => {
      logger.error({ error }, 'WebSocket server error');
      this.metrics.errors.inc({ type: 'server' });
    });

    logger.info({ port: config.port }, 'WebSocket server listening');
  }

  private setupSystemEventHandlers() {
    // Forward system events to subscribed clients
    this.eventBus.on('mcp:status', (event) => this.broadcastToChannel('mcp:status', event));
    this.eventBus.on('gpu:metrics', (event) => this.broadcastToChannel('gpu:metrics', event));
    this.eventBus.on('tools:discovery', (event) => this.broadcastToChannel('tools:discovery', event));
    this.eventBus.on('agent:coordination', (event) => this.broadcastToChannel('agent:coordination', event));
    this.eventBus.on('swarm:update', (event) => this.broadcastToChannel('swarm:update', event));
  }

  private async handleConnection(ws: WebSocket, req: IncomingMessage) {
    try {
      // Extract and verify JWT token
      const token = this.jwtAuth.extractFromRequest(req);
      let userId: string | undefined;
      let permissions: string[] = [];

      if (token) {
        const authData = this.jwtAuth.verify(token);
        if (authData) {
          userId = authData.userId;
          permissions = authData.permissions;
        } else {
          ws.send(JSON.stringify({
            type: 'error',
            payload: { message: 'Invalid authentication token' },
            timestamp: new Date().toISOString(),
          }));
          ws.close(1008, 'Invalid token');
          return;
        }
      } else if (config.nodeEnv === 'production') {
        // Require authentication in production
        ws.send(JSON.stringify({
          type: 'error',
          payload: { message: 'Authentication required' },
          timestamp: new Date().toISOString(),
        }));
        ws.close(1008, 'Authentication required');
        return;
      }

      // Create session
      const sessionId = this.sessionManager.createSession(ws, userId, permissions);
      this.metrics.connections.inc();

      // Send connection acknowledgment
      this.sendMessage(sessionId, {
        type: 'connection',
        sessionId,
        payload: {
          status: 'connected',
          version: '1.0.0',
          features: ['mcp_status', 'gpu_metrics', 'tool_discovery', 'agent_coordination'],
        },
        timestamp: new Date().toISOString(),
      });

      logger.info({ sessionId, userId }, 'Client connected');

      // Setup message handler
      ws.on('message', async (data) => {
        await this.handleMessage(sessionId, data);
      });

      // Setup close handler
      ws.on('close', () => {
        this.handleDisconnect(sessionId);
      });

      // Setup error handler
      ws.on('error', (error) => {
        logger.error({ sessionId, error }, 'WebSocket error');
        this.metrics.errors.inc({ type: 'socket' });
      });

      // Setup ping handler for keep-alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      }, 30000);

      ws.on('close', () => clearInterval(pingInterval));
      ws.on('pong', () => {
        this.sessionManager.updateActivity(sessionId);
      });

    } catch (error: any) {
      logger.error({ error }, 'Connection handling error');
      ws.close(1011, 'Internal server error');
      this.metrics.errors.inc({ type: 'connection' });
    }
  }

  private async handleMessage(sessionId: string, data: any) {
    const timer = this.metrics.messageDuration.startTimer();

    try {
      const message: ClientMessage = JSON.parse(data.toString());
      this.metrics.messages.inc({ direction: 'received', type: message.type });

      logger.debug({ sessionId, type: message.type }, 'Message received');

      // Update session activity
      this.sessionManager.updateActivity(sessionId);

      // Check rate limit
      const session = this.sessionManager.getSession(sessionId);
      if (session) {
        const rateLimitKey = session.userId || sessionId;
        const allowed = await this.rateLimiter.consume(rateLimitKey);

        if (!allowed) {
          this.sendError(sessionId, 'Rate limit exceeded');
          return;
        }
      }

      // Handle message types
      switch (message.type) {
        case 'subscribe':
          await this.handleSubscribe(sessionId, message);
          break;

        case 'unsubscribe':
          await this.handleUnsubscribe(sessionId, message);
          break;

        case 'ping':
          this.sendMessage(sessionId, {
            type: 'pong',
            timestamp: new Date().toISOString(),
          });
          break;

        case 'query':
          await this.handleQuery(sessionId, message);
          break;

        case 'command':
          await this.handleCommand(sessionId, message);
          break;

        default:
          this.sendError(sessionId, `Unknown message type: ${message.type}`);
      }

    } catch (error: any) {
      logger.error({ sessionId, error }, 'Message handling error');
      this.sendError(sessionId, 'Failed to process message');
      this.metrics.errors.inc({ type: 'message_handling' });
    } finally {
      timer();
    }
  }

  private async handleSubscribe(sessionId: string, message: ClientMessage) {
    const { channel } = message.payload || {};

    if (!channel) {
      this.sendError(sessionId, 'Channel name required');
      return;
    }

    const validChannels = [
      'mcp:status',
      'gpu:metrics',
      'tools:discovery',
      'agent:coordination',
      'swarm:update',
    ];

    if (!validChannels.includes(channel)) {
      this.sendError(sessionId, `Invalid channel: ${channel}`);
      return;
    }

    this.sessionManager.subscribe(sessionId, channel);
    this.metrics.subscriptions.inc({ channel });

    this.sendMessage(sessionId, {
      type: 'response',
      payload: {
        action: 'subscribed',
        channel,
      },
      timestamp: new Date().toISOString(),
    });

    logger.info({ sessionId, channel }, 'Subscribed to channel');
  }

  private async handleUnsubscribe(sessionId: string, message: ClientMessage) {
    const { channel } = message.payload || {};

    if (!channel) {
      this.sendError(sessionId, 'Channel name required');
      return;
    }

    this.sessionManager.unsubscribe(sessionId, channel);
    this.metrics.subscriptions.dec({ channel });

    this.sendMessage(sessionId, {
      type: 'response',
      payload: {
        action: 'unsubscribed',
        channel,
      },
      timestamp: new Date().toISOString(),
    });

    logger.info({ sessionId, channel }, 'Unsubscribed from channel');
  }

  private async handleQuery(sessionId: string, message: ClientMessage) {
    const { target } = message.payload || {};

    try {
      let data: any;

      switch (target) {
        case 'mcp:servers':
          // Trigger immediate poll
          await this.nexusIntegration.queryToolDiscovery();
          data = { status: 'requested' };
          break;

        case 'sessions:active':
          data = {
            count: this.sessionManager.getActiveSessions(),
            sessions: this.sessionManager.getAllSessions().map(s => ({
              sessionId: s.sessionId,
              userId: s.userId,
              subscriptions: Array.from(s.subscriptions),
              createdAt: s.createdAt,
            })),
          };
          break;

        default:
          this.sendError(sessionId, `Unknown query target: ${target}`);
          return;
      }

      this.sendMessage(sessionId, {
        type: 'response',
        payload: {
          query: target,
          data,
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error: any) {
      logger.error({ sessionId, error }, 'Query handling error');
      this.sendError(sessionId, `Query failed: ${error.message}`);
    }
  }

  private async handleCommand(sessionId: string, message: ClientMessage) {
    const session = this.sessionManager.getSession(sessionId);
    if (!session) {
      this.sendError(sessionId, 'Session not found');
      return;
    }

    // Check permissions
    if (!session.permissions.includes('command:execute')) {
      this.sendError(sessionId, 'Insufficient permissions');
      return;
    }

    const { command, params } = message.payload || {};

    try {
      const result = await this.nexusIntegration.sendCommand(command, params);

      this.sendMessage(sessionId, {
        type: 'response',
        payload: {
          command,
          result,
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error: any) {
      logger.error({ sessionId, command, error }, 'Command execution error');
      this.sendError(sessionId, `Command failed: ${error.message}`);
    }
  }

  private handleDisconnect(sessionId: string) {
    const session = this.sessionManager.getSession(sessionId);
    if (session) {
      // Update metrics
      this.metrics.connections.dec();
      session.subscriptions.forEach(channel => {
        this.metrics.subscriptions.dec({ channel });
      });

      this.sessionManager.deleteSession(sessionId);
      logger.info({ sessionId, userId: session.userId }, 'Client disconnected');
    }
  }

  private sendMessage(sessionId: string, message: ServerMessage) {
    const session = this.sessionManager.getSession(sessionId);
    if (session && session.ws.readyState === WebSocket.OPEN) {
      session.ws.send(JSON.stringify(message));
      this.metrics.messages.inc({ direction: 'sent', type: message.type });
    }
  }

  private sendError(sessionId: string, error: string) {
    this.sendMessage(sessionId, {
      type: 'error',
      payload: { message: error },
      timestamp: new Date().toISOString(),
    });
  }

  private broadcastToChannel(channel: string, event: SystemEvent) {
    const sessions = this.sessionManager.getAllSessions();
    let count = 0;

    for (const session of sessions) {
      if (session.subscriptions.has(channel)) {
        this.sendMessage(session.sessionId, {
          type: 'event',
          payload: event,
          timestamp: new Date().toISOString(),
        });
        count++;
      }
    }

    logger.debug({ channel, recipients: count }, 'Broadcast to channel');
  }

  async start() {
    // Start metrics server
    this.metrics.start();

    // Start session cleanup
    this.sessionManager.startCleanupTimer();

    // Start Nexus integration polling
    await this.nexusIntegration.startPolling();

    logger.info({ port: config.port }, 'WebSocket Hub started');
  }

  async stop() {
    this.nexusIntegration.stopPolling();

    // Close all connections
    for (const session of this.sessionManager.getAllSessions()) {
      session.ws.close(1001, 'Server shutting down');
    }

    this.wss.close();

    if (this.redis) {
      await this.redis.quit();
    }

    logger.info('WebSocket Hub stopped');
  }
}
