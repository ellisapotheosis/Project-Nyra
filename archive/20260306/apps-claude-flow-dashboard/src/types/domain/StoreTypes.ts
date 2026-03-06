import { Agent } from './AgentTypes';

export interface AgentStore {
  agents: Agent[];
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;
}

export interface TaskStatus {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStore {
  tasks: TaskStatus[];
  addTask: (task: TaskStatus) => void;
  updateTask: (id: string, updates: Partial<TaskStatus>) => void;
  removeTask: (id: string) => void;
}

export interface MemoryEntry {
  id: string;
  key: string;
  namespace: string;
  value: any;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryStore {
  entries: MemoryEntry[];
  addMemoryEntry: (entry: MemoryEntry) => void;
  updateMemoryEntry: (id: string, updates: Partial<MemoryEntry>) => void;
}

export interface MessageType {
  id: string;
  sender: string;
  recipient?: string;
  content: string;
  timestamp: string;
  type: 'system' | 'agent' | 'user';
}

export interface MessageStore {
  messages: MessageType[];
  addMessage: (message: MessageType) => void;
}