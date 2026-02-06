/**
 * Claude Flow Event Server
 * WebSocket server for Live Operations Dashboard real-time streaming
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { EventType, BaseEvent } from './types/events';
import dotenv from 'dotenv';

dotenv.config();

class ClaudeFlowEventServer {
  private app: express.Application;
  private httpServer: ReturnType<typeof createServer>;
  private wsServer: WebSocketServer;
  private eventEmitter: EventEmitter;
  private eventBuffer: BaseEvent[] = [];
  private readonly MAX_BUFFER_SIZE: number;
  private clients: Set<WebSocket> = new Set();
  private host: string;
  private port: number;
  private healthPort: number;

  constructor() {
    this.app = express();
    this.host = process.env.EVENT_SERVER_HOST || '0.0.0.0';
    this.port = parseInt(process.env.EVENT_SERVER_PORT || '3004', 10);
    this.healthPort = this.port + 1;
    this.MAX_BUFFER_SIZE = parseInt(process.env.EVENT_SERVER_REPLAY_BUFFER || '1000', 10);

    this.httpServer = createServer(this.app);
    this.wsServer = new WebSocketServer({ server: this.httpServer });
    this.eventEmitter = new EventEmitter();

    this.setupWebSocketServer();
    this.setupHealthCheckEndpoint();
    this.setupGracefulShutdown();
  }

  private setupWebSocketServer() {
    this.wsServer.on('connection', (ws: WebSocket) => {
      const clientId = this.generateClientId();
      this.clients.add(ws);
      this.logEvent('client:connected', { clientId, totalClients: this.clients.size });

      // Send recent events to new client
      this.eventBuffer.forEach(event => {
        ws.send(JSON.stringify(event));
      });

      ws.on('message', (message: string) => {
        try {
          const clientMessage = JSON.parse(message);
          if (clientMessage.type === 'subscribe') {
            // Future: Implement event subscription logic
          }
        } catch (error) {
          this.logEvent('log', {
            level: 'error',
            message: `Error parsing client message: ${error}`
          });
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        this.logEvent('client:disconnected', { clientId, totalClients: this.clients.size });
      });
    });
  }

  private setupHealthCheckEndpoint() {
    const healthApp = express();
    healthApp.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        uptime: process.uptime(),
        clients: this.clients.size,
        memory: process.memoryUsage()
      });
    });
    healthApp.listen(this.healthPort, this.host, () => {
      console.log(`Health check server running on http://${this.host}:${this.healthPort}/health`);
    });
  }

  private setupGracefulShutdown() {
    const shutdown = async () => {
      console.log('Shutting down gracefully...');
      this.wsServer.close();
      this.httpServer.close();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  }

  public async start() {
    return new Promise<void>((resolve, reject) => {
      try {
        this.httpServer.listen(this.port, this.host, () => {
          console.log(`Claude Flow Event Server running on ws://${this.host}:${this.port}`);
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private generateClientId(): string {
    return `client_${Math.random().toString(36).substr(2, 9)}`;
  }

  public broadcastEvent(event: BaseEvent) {
    // Buffer the event
    if (this.eventBuffer.length >= this.MAX_BUFFER_SIZE) {
      this.eventBuffer.shift(); // Remove oldest event
    }
    this.eventBuffer.push(event);

    // Broadcast to all connected clients
    const eventString = JSON.stringify(event);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(eventString);
      }
    });

    this.logEvent('event', event);
  }

  private logEvent(type: string, data: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      ...data
    };

    if (process.env.DEBUG === 'true') {
      console.log(JSON.stringify(logEntry));
    }

    this.eventEmitter.emit('log', logEntry);
  }

  public registerEventHandler(eventType: EventType, handler: (event: BaseEvent) => void) {
    this.eventEmitter.on(eventType, handler);
  }

  public emitEvent(eventType: EventType, eventData: BaseEvent) {
    this.eventEmitter.emit(eventType, eventData);
    this.broadcastEvent(eventData);
  }
}

async function main() {
  const server = new ClaudeFlowEventServer();

  try {
    await server.start();
  } catch (error) {
    console.error('Failed to start event server:', error);
    process.exit(1);
  }
}

main();