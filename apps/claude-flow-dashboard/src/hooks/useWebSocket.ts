import { useState, useEffect, useCallback, useRef } from 'react';

// Define WebSocket message type
export interface WebSocketMessage {
  type: string;
  data: any;
}

// Hook configuration type
export interface UseWebSocketConfig {
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

// Hook return type
export interface UseWebSocketReturn {
  sendMessage: (message: WebSocketMessage) => void;
  lastMessage: WebSocketMessage | null;
  isConnected: boolean;
}

// Hook options type
export type UseWebSocketOptions = UseWebSocketConfig;

// Default configuration
const defaultConfig: UseWebSocketConfig = {
  reconnectAttempts: 5,
  reconnectInterval: 3000
};

/**
 * Custom hook for managing WebSocket connections
 * @param url WebSocket server URL
 * @param onMessage Optional callback for handling incoming messages
 * @param onError Optional error handler
 * @param config Optional configuration for reconnection
 */
const useWebSocket = (
  url: string,
  onMessage?: (message: WebSocketMessage) => void,
  onError?: (error: Error) => void,
  config: UseWebSocketConfig = defaultConfig
): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);

  const connect = useCallback(() => {
    // Close existing connection if any
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Create new WebSocket connection
    const socket = new WebSocket(url);

    socket.addEventListener('open', () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    });

    socket.addEventListener('message', (event) => {
      try {
        const parsedMessage = JSON.parse(event.data);
        setLastMessage(parsedMessage);
        onMessage?.(parsedMessage);
      } catch (error) {
        onError?.(new Error(`Invalid message format: ${event.data}`));
      }
    });

    socket.addEventListener('close', (event) => {
      setIsConnected(false);

      // Attempt reconnection if not explicitly closed
      if (!event.wasClean && reconnectAttemptsRef.current < config.reconnectAttempts) {
        setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          connect();
        }, config.reconnectInterval);
      }
    });

    socket.addEventListener('error', (error) => {
      onError?.(error as Error);
      setIsConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, [url, onMessage, onError, config]);

  // Connection lifecycle
  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  // Send message method
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      throw new Error('WebSocket is not connected');
    }
  }, []);

  return {
    sendMessage,
    lastMessage,
    isConnected
  };
};

export default useWebSocket;
