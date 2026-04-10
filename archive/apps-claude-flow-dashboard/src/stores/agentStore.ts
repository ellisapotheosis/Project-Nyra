import { create } from 'zustand';
import { AgentStore } from '@/types/domain/StoreTypes';
import { Agent } from '@/types/domain/AgentTypes';

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  addAgent: (agent: Agent) => set((state) => ({
    agents: [...state.agents, agent]
  })),
  updateAgent: (id: string, updates: Partial<Agent>) => set((state) => ({
    agents: state.agents.map((agent) =>
      agent.id === id ? { ...agent, ...updates } : agent
    )
  })),
  removeAgent: (id: string) => set((state) => ({
    agents: state.agents.filter((agent) => agent.id !== id)
  }))
}));