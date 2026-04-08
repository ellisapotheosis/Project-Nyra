import { useState, useEffect, useCallback } from 'react';
import type { AgentEvent } from '@/types/domain/AgentTypes';
import type { AgentStatus } from '@/types/agents';
import { useAgentStore } from '@/store/agentStore';
import { useTaskStore } from '@/store/taskStore';
import { useMessageStore } from '@/store/messageStore';

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
      case 'spawn': {
        // Convert Agent to AgentState format for store
        const agent = event.agent;
        // Map incoming agent status to store status
        let status: AgentStatus = 'active';
        if (agent.status === 'completed') {
          status = 'idle';
        } else if (agent.status === 'error') {
          status = 'error';
        } else if (agent.status === 'idle') {
          status = 'idle';
        }

        addAgent({
          id: agent.id,
          name: agent.name,
          status: status,
          type: agent.type as any,
          metrics: {
            tasksCompleted: 0,
            tasksFailed: 0,
            avgTaskDuration: 0,
            errorCount: 0,
            uptime: 0,
            memoryUsageMb: 0,
            cpuPercent: 0,
          },
          createdAt: new Date(),
          lastActiveAt: new Date(),
        } as any);
        break;
      }
      case 'status-change': {
        // Map incoming agent status to store status
        let status: AgentStatus = 'active';
        if (event.agent.status === 'completed') {
          status = 'idle';
        } else if (event.agent.status === 'error') {
          status = 'error';
        } else if (event.agent.status === 'idle') {
          status = 'idle';
        }
        updateAgent(event.agent.id, { status });
        break;
      }
      case 'metric-update': {
        // Map incoming metrics to AgentMetrics format
        const metrics = event.agent.metrics || {};
        updateAgent(event.agent.id, {
          metrics: {
            tasksCompleted: 0,
            tasksFailed: 0,
            avgTaskDuration: 0,
            errorCount: 0,
            uptime: 0,
            memoryUsageMb: metrics && (metrics as any).memoryUsage !== undefined
              ? (metrics as any).memoryUsage
              : 0,
            cpuPercent: metrics && (metrics as any).cpuUsage !== undefined
              ? (metrics as any).cpuUsage
              : 0,
          }
        });
        break;
      }
    }
  }, [addAgent, updateAgent]);

  const handleTaskEvent = useCallback((event: any): void => {
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
    // Memory events are logged but not persisted in this version
    // TODO: Implement memory store integration when memoryStore is ready
    console.log('Memory event received:', event);
  }, []);

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