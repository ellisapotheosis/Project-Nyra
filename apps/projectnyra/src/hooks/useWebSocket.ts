"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface WebSocketOptions {
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  connected: boolean;
  error: string | null;
  emit: (event: string, data?: any) => void;
  disconnect: () => void;
}

export function useWebSocket(
  url?: string,
  options: WebSocketOptions = {}
): UseWebSocketReturn {
  const {
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
  } = options;

  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const wsUrl =
    url || process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:6000";

  useEffect(() => {
    if (!autoConnect) return;

    const socket = io(wsUrl, {
      transports: ["websocket", "polling"],
      reconnection,
      reconnectionAttempts,
      reconnectionDelay,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setError(null);
      console.log("WebSocket connected");
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("WebSocket disconnected");
    });

    socket.on("connect_error", (err) => {
      setError(err.message);
      console.error("WebSocket connection error:", err);
    });

    socket.on("error", (err) => {
      setError(err.message || "WebSocket error occurred");
      console.error("WebSocket error:", err);
    });

    return () => {
      socket.disconnect();
    };
  }, [
    wsUrl,
    autoConnect,
    reconnection,
    reconnectionAttempts,
    reconnectionDelay,
  ]);

  const emit = (event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn("Socket not connected, cannot emit event:", event);
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  return {
    socket: socketRef.current,
    connected,
    error,
    emit,
    disconnect,
  };
}

// Specific hook for real-time mortgage rates
export interface MortgageRate {
  id: string;
  product: string;
  rate: number;
  apr: number;
  points: number;
  change: number;
  trend: "up" | "down" | "stable";
  lastUpdated: string;
  lender?: string;
}

export function useRealTimeRates() {
  const [rates, setRates] = useState<MortgageRate[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const { socket, connected } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    // Subscribe to rate updates
    socket.emit("subscribe", { channel: "mortgage-rates" });

    // Handle rate updates
    socket.on(
      "rate-update",
      (data: { rates: MortgageRate[]; timestamp: string }) => {
        setRates(data.rates);
        setLastUpdate(data.timestamp);
      }
    );

    // Handle individual rate changes
    socket.on(
      "rate-change",
      (data: {
        rateId: string;
        newRate: number;
        change: number;
        trend: "up" | "down" | "stable";
      }) => {
        setRates((prevRates) =>
          prevRates.map((rate) =>
            rate.id === data.rateId
              ? {
                  ...rate,
                  rate: data.newRate,
                  change: data.change,
                  trend: data.trend,
                  lastUpdated: new Date().toISOString(),
                }
              : rate
          )
        );
      }
    );

    // Request initial rates
    socket.emit("get-current-rates");

    return () => {
      socket.off("rate-update");
      socket.off("rate-change");
      socket.emit("unsubscribe", { channel: "mortgage-rates" });
    };
  }, [socket]);

  const subscribeToRate = (productType: string) => {
    if (socket) {
      socket.emit("subscribe-rate", { product: productType });
    }
  };

  const unsubscribeFromRate = (productType: string) => {
    if (socket) {
      socket.emit("unsubscribe-rate", { product: productType });
    }
  };

  return {
    rates,
    lastUpdate,
    connected,
    subscribeToRate,
    unsubscribeFromRate,
  };
}

// Hook for real-time notifications
export interface NotificationData {
  id: string;
  type: "lead" | "quote" | "application" | "system" | "compliance";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  data?: any;
}

export function useRealTimeNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket, connected } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    // Subscribe to notifications
    socket.emit("subscribe", { channel: "notifications" });

    // Handle new notifications
    socket.on("notification", (notification: NotificationData) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // Handle notification updates (e.g., mark as read)
    socket.on("notification-update", (data: { id: string; read: boolean }) => {
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === data.id ? { ...notif, read: data.read } : notif
        )
      );
      if (data.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    });

    return () => {
      socket.off("notification");
      socket.off("notification-update");
      socket.emit("unsubscribe", { channel: "notifications" });
    };
  }, [socket]);

  const markAsRead = (notificationId: string) => {
    if (socket) {
      socket.emit("mark-notification-read", { id: notificationId });
    }
  };

  const markAllAsRead = () => {
    if (socket) {
      socket.emit("mark-all-notifications-read");
      setUnreadCount(0);
    }
  };

  return {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
  };
}
