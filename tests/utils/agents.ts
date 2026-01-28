/**
 * Test Agent Utilities
 *
 * TDD London School approach for agent testing:
 * - Mock agent behaviors
 * - Test interactions between agents
 * - Verify message passing and coordination
 */

import { vi } from 'vitest';

export interface TestAgent {
  id: string;
  type: string;
  spawn: () => Promise<void>;
  execute: (task: any) => Promise<any>;
  communicate: (targetAgent: string, message: any) => Promise<void>;
  stop: () => Promise<void>;
  getStatus: () => Promise<AgentStatus>;
}

export interface AgentStatus {
  id: string;
  type: string;
  status: 'idle' | 'running' | 'stopped' | 'error';
  currentTask?: string;
  tasksCompleted: number;
}

export const createMockAgent = (type: string, id?: string): TestAgent => {
  const agentId = id || `mock-${type}-${Date.now()}`;
  let status: AgentStatus = {
    id: agentId,
    type,
    status: 'idle',
    tasksCompleted: 0
  };

  return {
    id: agentId,
    type,
    spawn: vi.fn().mockImplementation(async () => {
      status.status = 'running';
    }),
    execute: vi.fn().mockImplementation(async (task: any) => {
      status.status = 'running';
      status.currentTask = task.description;

      // Simulate task execution
      await new Promise(resolve => setTimeout(resolve, 10));

      status.tasksCompleted++;
      status.status = 'idle';
      delete status.currentTask;

      return {
        success: true,
        result: `Task completed by ${type}`,
        duration: 10
      };
    }),
    communicate: vi.fn().mockImplementation(async (targetAgent: string, message: any) => {
      // Mock inter-agent communication
      return;
    }),
    stop: vi.fn().mockImplementation(async () => {
      status.status = 'stopped';
    }),
    getStatus: vi.fn().mockImplementation(async () => {
      return { ...status };
    })
  };
};

export const createMockSwarm = (topology: 'mesh' | 'hierarchical' | 'star' = 'mesh', agentTypes: string[] = []) => {
  const agents = agentTypes.map(type => createMockAgent(type));
  const swarmId = `mock-swarm-${Date.now()}`;

  return {
    id: swarmId,
    topology,
    agents,
    init: vi.fn().mockResolvedValue({
      swarmId,
      topology,
      agentCount: agents.length
    }),
    spawnAgent: vi.fn().mockImplementation(async (type: string) => {
      const agent = createMockAgent(type);
      await agent.spawn();
      agents.push(agent);
      return agent;
    }),
    coordinateTask: vi.fn().mockImplementation(async (task: any) => {
      // Mock swarm coordination
      const results = await Promise.all(
        agents.map(agent => agent.execute(task))
      );
      return {
        swarmId,
        task,
        results,
        success: true
      };
    }),
    shutdown: vi.fn().mockImplementation(async () => {
      await Promise.all(agents.map(agent => agent.stop()));
    }),
    getStatus: vi.fn().mockImplementation(async () => {
      const statuses = await Promise.all(
        agents.map(agent => agent.getStatus())
      );
      return {
        swarmId,
        topology,
        agents: statuses
      };
    })
  };
};

// Agent type factories
export const createCoderAgent = (id?: string) => createMockAgent('coder', id);
export const createTesterAgent = (id?: string) => createMockAgent('tester', id);
export const createReviewerAgent = (id?: string) => createMockAgent('reviewer', id);
export const createArchitectAgent = (id?: string) => createMockAgent('architect', id);
export const createResearcherAgent = (id?: string) => createMockAgent('researcher', id);
export const createSecurityAgent = (id?: string) => createMockAgent('security-architect', id);
export const createComplianceAgent = (id?: string) => createMockAgent('compliance-agent', id);
export const createMortgageQuoteAgent = (id?: string) => createMockAgent('mortgage-quote-agent', id);
