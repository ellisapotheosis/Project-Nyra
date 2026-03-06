class WebSocketManager {
  private static instance: WebSocketManager;
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private listeners: { [key: string]: Set<(data: any) => void> } = {};

  private constructor(url: string = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3004') {
    this.url = url;
    this.connect();
  }

  public static getInstance(url?: string): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager(url);
    }
    return WebSocketManager.instance;
  }

  private connect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.sendInitMessage();
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        this.dispatchEvent(data.type, data.payload);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = (event: CloseEvent) => {
      console.log(`WebSocket closed: ${event.reason}`);
      this.reconnect();
    };

    this.socket.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      this.reconnect();
    };
  }

  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    setTimeout(() => {
      console.log(`Attempting to reconnect (attempt ${this.reconnectAttempts})`);
      this.connect();
    }, timeout);
  }

  private sendInitMessage(): void {
    this.send('dashboard-init', { timestamp: new Date().toISOString() });
  }

  public send(type: string, payload: any): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }

    this.socket.send(JSON.stringify({ type, payload }));
  }

  public addEventListener(type: string, callback: (data: any) => void): () => void {
    if (!this.listeners[type]) {
      this.listeners[type] = new Set();
    }
    this.listeners[type].add(callback);

    return () => {
      this.listeners[type].delete(callback);
    };
  }

  private dispatchEvent(type: string, data: any): void {
    if (this.listeners[type]) {
      this.listeners[type].forEach(listener => listener(data));
    }
  }

  public close(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export default WebSocketManager;