import { WorkerNode, AgentActionRisk } from '@nyra/domain-models';

export class RoutingService {
  private workers: WorkerNode[] = [
    { id: '5090', role: 'RTX5090_BURST', hostname: 'worker-rtx5090', status: 'ONLINE', activeModels: ['llama-3-70b', 'claude-3-opus'] },
    { id: '3090', role: 'RTX3090TI_STEADY', hostname: 'worker-rtx3090ti', status: 'ONLINE', activeModels: ['llama-3-8b'] },
    { id: '3060', role: 'RTX3060_LIGHTWEIGHT', hostname: 'worker-rtx3060', status: 'ONLINE', activeModels: ['phi-3'] }
  ];

  /**
   * Determine the best worker for a given task and risk level
   */
  route(task: string, risk: AgentActionRisk): WorkerNode {
    console.log(`[Router] Evaluating route for task: ${task} (Risk: ${risk})`);

    // Rule: High risk or complex reasoning goes to 5090
    if (risk === 'COMPLIANCE_CRITICAL' || task.toLowerCase().includes('quote') || task.toLowerCase().includes('analysis')) {
      return this.workers.find(w => w.id === '5090')!;
    }

    // Rule: Steady state / mutations go to 3090
    if (risk === 'CRM_MUTATION') {
      return this.workers.find(w => w.id === '3090')!;
    }

    // Default to lightweight 3060
    return this.workers.find(w => w.id === '3060')!;
  }
}
