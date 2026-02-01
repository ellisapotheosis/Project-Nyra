/**
 * Agent Coordination Unit Tests
 *
 * TDD London School approach:
 * - Test agent interactions and message passing
 * - Mock all dependencies
 * - Focus on behavior verification
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createCoderAgent,
  createTesterAgent,
  createReviewerAgent,
  createMockSwarm
} from '@utils/agents';

describe('Agent Coordination', () => {
  describe('Single Agent Lifecycle', () => {
    it('should spawn agent successfully', async () => {
      const agent = createCoderAgent();

      await agent.spawn();

      expect(agent.spawn).toHaveBeenCalled();
      const status = await agent.getStatus();
      expect(status.status).toBe('running');
    });

    it('should execute task and update status', async () => {
      const agent = createCoderAgent();
      await agent.spawn();

      const task = { description: 'Write unit test' };
      const result = await agent.execute(task);

      expect(agent.execute).toHaveBeenCalledWith(task);
      expect(result.success).toBe(true);

      const status = await agent.getStatus();
      expect(status.tasksCompleted).toBe(1);
    });

    it('should stop agent gracefully', async () => {
      const agent = createCoderAgent();
      await agent.spawn();

      await agent.stop();

      expect(agent.stop).toHaveBeenCalled();
      const status = await agent.getStatus();
      expect(status.status).toBe('stopped');
    });
  });

  describe('Agent Communication', () => {
    it('should send message to another agent', async () => {
      const coder = createCoderAgent('coder-1');
      const tester = createTesterAgent('tester-1');

      await coder.spawn();
      await tester.spawn();

      const message = { type: 'task-complete', data: 'Code ready for testing' };
      await coder.communicate(tester.id, message);

      expect(coder.communicate).toHaveBeenCalledWith(tester.id, message);
    });

    it('should handle peer-to-peer communication in mesh topology', async () => {
      const agents = [
        createCoderAgent('coder-1'),
        createTesterAgent('tester-1'),
        createReviewerAgent('reviewer-1')
      ];

      await Promise.all(agents.map(agent => agent.spawn()));

      // Simulate mesh communication
      await agents[0].communicate(agents[1].id, { type: 'code-ready' });
      await agents[1].communicate(agents[2].id, { type: 'tests-pass' });
      await agents[2].communicate(agents[0].id, { type: 'review-complete' });

      expect(agents[0].communicate).toHaveBeenCalled();
      expect(agents[1].communicate).toHaveBeenCalled();
      expect(agents[2].communicate).toHaveBeenCalled();
    });
  });

  describe('Swarm Coordination', () => {
    it('should initialize mesh swarm with multiple agents', async () => {
      const swarm = createMockSwarm('mesh', ['coder', 'tester', 'reviewer']);

      const result = await swarm.init();

      expect(result.topology).toBe('mesh');
      expect(result.agentCount).toBe(3);
      expect(swarm.init).toHaveBeenCalled();
    });

    it('should coordinate task across all agents in parallel', async () => {
      const swarm = createMockSwarm('mesh', ['coder', 'tester']);
      await swarm.init();

      const task = { description: 'Implement feature with TDD' };
      const result = await swarm.coordinateTask(task);

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);
      expect(swarm.coordinateTask).toHaveBeenCalledWith(task);
    });

    it('should spawn additional agent dynamically', async () => {
      const swarm = createMockSwarm('mesh', ['coder']);
      await swarm.init();

      const newAgent = await swarm.spawnAgent('reviewer');

      expect(newAgent.type).toBe('reviewer');
      expect(swarm.agents).toHaveLength(2);
    });

    it('should shutdown swarm gracefully', async () => {
      const swarm = createMockSwarm('mesh', ['coder', 'tester']);
      await swarm.init();

      await swarm.shutdown();

      expect(swarm.shutdown).toHaveBeenCalled();

      const status = await swarm.getStatus();
      status.agents.forEach((agent: any) => {
        expect(agent.status).toBe('stopped');
      });
    });
  });

  describe('TDD Workflow Coordination', () => {
    it('should coordinate TDD Red-Green-Refactor cycle', async () => {
      const swarm = createMockSwarm('mesh', ['tester', 'coder', 'reviewer']);
      await swarm.init();

      // Red: Write failing tests
      const redTask = { phase: 'red', description: 'Write failing tests' };
      const redResult = await swarm.agents[0].execute(redTask);
      expect(redResult.success).toBe(true);

      // Green: Implement minimal solution
      const greenTask = { phase: 'green', description: 'Implement solution' };
      const greenResult = await swarm.agents[1].execute(greenTask);
      expect(greenResult.success).toBe(true);

      // Refactor: Optimize code
      const refactorTask = { phase: 'refactor', description: 'Refactor code' };
      const refactorResult = await swarm.agents[2].execute(refactorTask);
      expect(refactorResult.success).toBe(true);

      // Verify all agents completed tasks
      const statuses = await Promise.all(
        swarm.agents.map(agent => agent.getStatus())
      );
      statuses.forEach(status => {
        expect(status.tasksCompleted).toBeGreaterThanOrEqual(1);
      });
    });
  });
});
