import { IWorkflowControl } from "./index";

export class MockWorkflowControl implements IWorkflowControl {
  async alignGoals(leadId: string, goals: string[]): Promise<void> {
    console.log(
      `[MockWorkflow] [Paperclip] Aligning goals for ${leadId}: ${goals.join(", ")}`
    );
    console.log(`[AUDIT] PAPERCLIP_GOAL_ALIGNMENT: ${leadId}`);
  }

  async coordinateAgents(task: string, agents: string[]): Promise<void> {
    console.log(
      `[MockWorkflow] [ClawTeam] Coordinating ${agents.join(", ")} for task: ${task}`
    );
    console.log(`[AUDIT] CLAWTEAM_COORDINATION: ${task}`);
  }
}
