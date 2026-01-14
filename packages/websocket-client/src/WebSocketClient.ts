import EventEmitter from 'eventemitter3';
import {
  WebSocketClientOptions,
  ClientMessage,
  ServerMessage,
  ConnectionInfo,
  SystemEvent,
  EventCallback,
  ConnectionCallback,
  ErrorCallback,
} from './types';

export class WebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private url: string;
  private options: Required<WebSocketClientOptions>;
  private reconnectAttempts = 0;
  private reconnectTimer: any = null;
  private heartbeatTimer: any = null;
  private sessionId: string | null = null;
  private connectionInfo: ConnectionInfo | null = null;

  constructor(url: string, options: WebSocketClientOptions = {}) {
    super();

    this.url = url;
    this.options = {
      token: options.token || '',
      reconnect: options.reconnect ?? true,
      reconnectInterval: options.reconnectInterval || 1000,
      maxReconnectAttempts: options.maxReconnectAttempts || 5,
      heartbeatInterval: options.heartbeatInterval || 30000,
      debug: options.debug || false,
    };
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Build URL with token
        const wsUrl = this.options.token
          ? `${this.url}?token=${this.options.token}`
          : this.url;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.log('Connected to WebSocket');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('connection', true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          this.log('WebSocket error:', error);
          this.emit('error', new Error('WebSocket error'));
          reject(error);
        };

        this.ws.onclose = (event) => {
          this.log('WebSocket closed:', event.code, event.reason);
          this.stopHeartbeat();
          this.emit('connection', false);
          this.handleDisconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(data: string) {
    try {
      const message: ServerMessage = JSON.parse(data);

      this.log('Received:', message.type);

      switch (message.type) {
        case 'connection':
          this.sessionId = message.sessionId || null;
          this.connectionInfo = message.payload as ConnectionInfo;
          this.emit('connected', this.connectionInfo);
          break;

        case 'event':
          const event = message.payload as SystemEvent;
          this.emit('event', event);
          this.emit(event.type, event);
          break;

        case 'error':
          this.emit('error', new Error(message.payload?.message || 'Unknown error'));
          break;

        case 'pong':
          this.log('Pong received');
          break;

        case 'response':
          this.emit('response', message.payload);
          break;

        default:
          this.log('Unknown message type:', message.type);
      }
    } catch (error) {
      this.log('Failed to parse message:', error);
      this.emit('error', error as Error);
    }
  }

  private handleDisconnect() {
    if (this.options.reconnect && this.reconnectAttempts < this.options.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);

      this.reconnectTimer = setTimeout(() => {
        this.connect().catch((error) => {
          this.log('Reconnection failed:', error);
        });
      }, this.options.reconnectInterval * this.reconnectAttempts);
    } else if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.log('Max reconnection attempts reached');
      this.emit('error', new Error('Failed to reconnect'));
    }
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.ping();
      }
    }, this.options.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private send(message: ClientMessage) {
    if (!this.isConnected()) {
      throw new Error('WebSocket is not connected');
    }

    this.ws!.send(JSON.stringify(message));
    this.log('Sent:', message.type);
  }

  async subscribe(channel: string): Promise<void> {
    this.send({
      type: 'subscribe',
      payload: { channel },
    });

    this.log(`Subscribed to ${channel}`);
  }

  async unsubscribe(channel: string): Promise<void> {
    this.send({
      type: 'unsubscribe',
      payload: { channel },
    });

    this.log(`Unsubscribed from ${channel}`);
  }

  async query(target: string): Promise<void> {
    this.send({
      type: 'query',
      payload: { target },
    });
  }

  async command(command: string, params?: any): Promise<void> {
    this.send({
      type: 'command',
      payload: { command, params },
    });
  }

  ping() {
    this.send({ type: 'ping' });
  }

  disconnect() {
    if (this.ws) {
      this.options.reconnect = false; // Prevent auto-reconnect
      this.stopHeartbeat();
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
      }
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  getConnectionInfo(): ConnectionInfo | null {
    return this.connectionInfo;
  }

  // Event listener helpers with types
  onConnection(callback: ConnectionCallback): this {
    return this.on('connection', callback);
  }

  onEvent(callback: EventCallback): this {
    return this.on('event', callback);
  }

  onError(callback: ErrorCallback): this {
    return this.on('error', callback);
  }

  onMCPStatus(callback: EventCallback): this {
    return this.on('mcp_status', callback);
  }

  onGPUMetrics(callback: EventCallback): this {
    return this.on('gpu_metrics', callback);
  }

  onToolDiscovery(callback: EventCallback): this {
    return this.on('tool_discovery', callback);
  }

  onAgentCoordination(callback: EventCallback): this {
    return this.on('agent_coordination', callback);
  }

  onSwarmUpdate(callback: EventCallback): this {
    return this.on('swarm_update', callback);
  }

  private log(...args: any[]) {
    if (this.options.debug) {
      console.log('[WebSocketClient]', ...args);
    }
  }
}
