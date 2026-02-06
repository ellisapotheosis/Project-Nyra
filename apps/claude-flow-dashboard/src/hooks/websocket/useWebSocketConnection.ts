import { useState, useEffect, useCallback } from 'react';
import { Agent, AgentEvent } from '@/types/domain/AgentTypes';
import { useAgentStore } from '@/store/agentStore';
import { useTaskStore } from '@/store/taskStore';
import { useMessageStore } from '@/store/messageStore';
import { useMemoryStore } from '@/store/memoryStore';

interface WebSocketHook {
  isConnected: boolean;
  reconnect: () => void;
}

export const useWebSocketConnection = (
  url: string = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3004'
): WebSocketHook => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const addAgent = useAgentStore(state => state.addAgent);
  const updateAgent = useAgentStore(state => state.updateAgent);
  const removeAgent = useAgentStore(state => state.removeAgent);

  const addTask = useTaskStore(state => state.addTask);
  const updateTask = useTaskStore(state => state.updateTask);
  const removeTask = useTaskStore(state => state.removeTask);

  const addMessage = useMessageStore(state => state.addMessage);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'agent-event':
          handleAgentEvent(data.payload);
          break;
        case 'task-event':
          handleTaskEvent(data.payload);
          break;
        case 'memory-event':
          handleMemoryEvent(data.payload);
          break;
        case 'message-event':
          handleMessageEvent(data.payload);
          break;
        default:
          console.warn('Unknown event type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, []);

  const handleAgentEvent = useCallback((event: AgentEvent) => {
    switch (event.type) {
      case 'spawn':
        addAgent(event.agent);
        break;
      case 'status-change':
        updateAgent(event.agent.id, { status: event.agent.status });
        break;
      case 'metric-update':
        updateAgent(event.agent.id, { metrics: event.agent.metrics });
        break;
    }
  }, [addAgent, updateAgent]);

  const handleTaskEvent = useCallback((event: any) => {
    switch (event.type) {
      case 'create':
        addTask(event.task);
        break;
      case 'update':
        updateTask(event.task.id, event.task);
        break;
      case 'delete':
        removeTask(event.task.id);
        break;
    }
  }, [addTask, updateTask, removeTask]);

  const handleMemoryEvent = useCallback((event: any) => {
    switch (event.type) {
      case 'add':
        addMemoryEntry(event.entry);
        break;
      case 'update':
        updateMemoryEntry(event.entry.id, event.entry);
        break;
    }
  }, [addMemoryEntry, updateMemoryEntry]);

  const handleMessageEvent = useCallback((event: any) => {
    addMessage(event.message);
  }, [addMessage]);

  const connect = useCallback(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      ws.send(JSON.stringify({ type: 'dashboard-init' }));
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);

      // Reconnect with exponential backoff
      setTimeout(connect, Math.random() * 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onmessage = handleMessage;

    setSocket(ws);
  }, [url, handleMessage]);

  const reconnect = useCallback(() => {
    if (socket) {
      socket.close();
    }
    connect();
  }, [socket, connect]);

  useEffect(() => {
    connect();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [connect, socket]);

  return {
    isConnected,
    reconnect
  };
};