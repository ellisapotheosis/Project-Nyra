import { useState, useEffect, useCallback, useRef } from "react";
import { WebSocketClient } from "../WebSocketClient";
import {
  WebSocketClientOptions,
  SystemEvent,
  ConnectionInfo,
  ProductEventChannel,
} from "../types";

export interface UseWebSocketOptions extends WebSocketClientOptions {
  autoConnect?: boolean;
}

export interface UseWebSocketReturn {
  connected: boolean;
  connecting: boolean;
  sessionId: string | null;
  connectionInfo: ConnectionInfo | null;
  events: SystemEvent[];
  error: Error | null;
  subscribe: (channel: string) => Promise<void>;
  unsubscribe: (channel: string) => Promise<void>;
  query: (target: string) => Promise<void>;
  command: (command: string, params?: any) => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => void;
  clearEvents: () => void;
}

export function useWebSocket(
  url: string,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(
    null
  );
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const clientRef = useRef<WebSocketClient | null>(null);
  const { autoConnect = true, ...clientOptions } = options;

  const connect = useCallback(async () => {
    if (clientRef.current || connecting) return;

    setConnecting(true);
    setError(null);

    try {
      const client = new WebSocketClient(url, clientOptions);

      // Setup event listeners
      client.onConnection((isConnected) => {
        setConnected(isConnected);
        if (!isConnected) {
          setSessionId(null);
          setConnectionInfo(null);
        }
      });

      client.on("connected", (info: ConnectionInfo) => {
        setSessionId(client.getSessionId());
        setConnectionInfo(info);
      });

      client.onEvent((event: SystemEvent) => {
        setEvents((prev) => [...prev, event]);
      });

      client.onError((err: Error) => {
        setError(err);
      });

      await client.connect();
      clientRef.current = client;
    } catch (err) {
      setError(err as Error);
    } finally {
      setConnecting(false);
    }
  }, [url, clientOptions, connecting]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
      setConnected(false);
      setSessionId(null);
      setConnectionInfo(null);
    }
  }, []);

  const subscribe = useCallback(async (channel: string) => {
    if (!clientRef.current) {
      throw new Error("WebSocket not connected");
    }
    await clientRef.current.subscribe(channel);
  }, []);

  const unsubscribe = useCallback(async (channel: string) => {
    if (!clientRef.current) {
      throw new Error("WebSocket not connected");
    }
    await clientRef.current.unsubscribe(channel);
  }, []);

  const query = useCallback(async (target: string) => {
    if (!clientRef.current) {
      throw new Error("WebSocket not connected");
    }
    await clientRef.current.query(target);
  }, []);

  const command = useCallback(async (cmd: string, params?: any) => {
    if (!clientRef.current) {
      throw new Error("WebSocket not connected");
    }
    await clientRef.current.command(cmd, params);
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    connected,
    connecting,
    sessionId,
    connectionInfo,
    events,
    error,
    subscribe,
    unsubscribe,
    query,
    command,
    connect,
    disconnect,
    clearEvents,
  };
}

// Hook for specific event types
export function useWebSocketEvent(
  url: string,
  eventType: string,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn & { filteredEvents: SystemEvent[] } {
  const websocket = useWebSocket(url, options);
  const filteredEvents = websocket.events.filter((e) => e.type === eventType);

  return {
    ...websocket,
    filteredEvents,
  };
}

// Hook for MCP status
export function useMCPStatus(url: string, options: UseWebSocketOptions = {}) {
  const { subscribe, ...rest } = useWebSocketEvent(url, "mcp_status", options);

  useEffect(() => {
    if (rest.connected) {
      subscribe("mcp:status");
    }
  }, [rest.connected, subscribe]);

  return rest;
}

// Hook for GPU metrics
export function useGPUMetrics(url: string, options: UseWebSocketOptions = {}) {
  const { subscribe, ...rest } = useWebSocketEvent(url, "gpu_metrics", options);

  useEffect(() => {
    if (rest.connected) {
      subscribe("gpu:metrics");
    }
  }, [rest.connected, subscribe]);

  return rest;
}

export function useProductEventChannel(
  url: string,
  channel: ProductEventChannel,
  options: UseWebSocketOptions = {}
) {
  const { subscribe, ...rest } = useWebSocketEvent(url, channel, options);

  useEffect(() => {
    if (rest.connected) {
      subscribe(channel);
    }
  }, [channel, rest.connected, subscribe]);

  return rest;
}

export function useLeadUpdates(url: string, options: UseWebSocketOptions = {}) {
  return useProductEventChannel(url, "lead:updates", options);
}
