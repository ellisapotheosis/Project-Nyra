import { N8nClientService, WorkflowExecution } from './n8n-client.service';

export interface CampaignAnalytics {
  workflowId: string;
  workflowName: string;
  totalExecutions: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  averageExecutionTime: number;
  executionsByDay: Map<string, number>;
  executionsByStatus: {
    success: number;
    error: number;
    running: number;
    waiting: number;
  };
  lastExecution?: Date;
  performanceMetrics: {
    p50: number; // Median execution time
    p95: number; // 95th percentile
    p99: number; // 99th percentile
  };
}

export interface WorkflowPerformance {
  workflowId: string;
  date: string;
  executions: number;
  successRate: number;
  averageTime: number;
}

export interface CampaignComparison {
  workflows: Array<{
    id: string;
    name: string;
    successRate: number;
    avgExecutionTime: number;
    totalExecutions: number;
  }>;
  bestPerformer: string;
  worstPerformer: string;
}

export class WorkflowAnalyticsService {
  private n8nClient: N8nClientService;

  constructor(n8nClient?: N8nClientService) {
    this.n8nClient = n8nClient || new N8nClientService();
  }

  /**
   * Get comprehensive analytics for a workflow
   */
  async getWorkflowAnalytics(workflowId: string): Promise<CampaignAnalytics> {
    const workflow = await this.n8nClient.getWorkflow(workflowId);
    const executions = await this.n8nClient.getExecutions(workflowId);

    const executionTimes: number[] = [];
    const executionsByDay = new Map<string, number>();
    const executionsByStatus = {
      success: 0,
      error: 0,
      running: 0,
      waiting: 0,
    };

    let lastExecution: Date | undefined;

    for (const execution of executions) {
      // Count by status
      executionsByStatus[execution.status]++;

      // Calculate execution time
      if (execution.startedAt && execution.stoppedAt) {
        const startTime = new Date(execution.startedAt).getTime();
        const stopTime = new Date(execution.stoppedAt).getTime();
        const executionTime = stopTime - startTime;
        executionTimes.push(executionTime);
      }

      // Count by day
      const day = new Date(execution.startedAt).toISOString().split('T')[0];
      executionsByDay.set(day, (executionsByDay.get(day) || 0) + 1);

      // Track last execution
      const execDate = new Date(execution.startedAt);
      if (!lastExecution || execDate > lastExecution) {
        lastExecution = execDate;
      }
    }

    const totalExecutions = executions.length;
    const successCount = executionsByStatus.success;
    const errorCount = executionsByStatus.error;
    const successRate = totalExecutions > 0 ? (successCount / totalExecutions) * 100 : 0;

    const averageExecutionTime =
      executionTimes.length > 0
        ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
        : 0;

    // Calculate percentiles
    const sortedTimes = executionTimes.sort((a, b) => a - b);
    const performanceMetrics = {
      p50: this.calculatePercentile(sortedTimes, 50),
      p95: this.calculatePercentile(sortedTimes, 95),
      p99: this.calculatePercentile(sortedTimes, 99),
    };

    return {
      workflowId,
      workflowName: workflow.name,
      totalExecutions,
      successCount,
      errorCount,
      successRate,
      averageExecutionTime,
      executionsByDay,
      executionsByStatus,
      lastExecution,
      performanceMetrics,
    };
  }

  /**
   * Get analytics for all workflows
   */
  async getAllWorkflowAnalytics(): Promise<CampaignAnalytics[]> {
    const workflows = await this.n8nClient.getWorkflows();
    const analytics: CampaignAnalytics[] = [];

    for (const workflow of workflows) {
      try {
        const workflowAnalytics = await this.getWorkflowAnalytics(workflow.id);
        analytics.push(workflowAnalytics);
      } catch (error) {
        console.error(`Error getting analytics for workflow ${workflow.id}:`, error);
      }
    }

    return analytics;
  }

  /**
   * Get workflow performance over time
   */
  async getWorkflowPerformance(
    workflowId: string,
    days: number = 30
  ): Promise<WorkflowPerformance[]> {
    const executions = await this.n8nClient.getExecutions(workflowId);
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const performanceByDay = new Map<string, WorkflowPerformance>();

    for (const execution of executions) {
      const execDate = new Date(execution.startedAt);
      if (execDate < startDate) continue;

      const dateKey = execDate.toISOString().split('T')[0];

      if (!performanceByDay.has(dateKey)) {
        performanceByDay.set(dateKey, {
          workflowId,
          date: dateKey,
          executions: 0,
          successRate: 0,
          averageTime: 0,
        });
      }

      const dayPerf = performanceByDay.get(dateKey)!;
      dayPerf.executions++;

      if (execution.status === 'success') {
        dayPerf.successRate++;
      }

      if (execution.startedAt && execution.stoppedAt) {
        const startTime = new Date(execution.startedAt).getTime();
        const stopTime = new Date(execution.stoppedAt).getTime();
        dayPerf.averageTime += stopTime - startTime;
      }
    }

    // Calculate averages
    const performance = Array.from(performanceByDay.values()).map((perf) => ({
      ...perf,
      successRate: (perf.successRate / perf.executions) * 100,
      averageTime: perf.averageTime / perf.executions,
    }));

    return performance.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Compare multiple workflows
   */
  async compareWorkflows(workflowIds: string[]): Promise<CampaignComparison> {
    const workflowStats = await Promise.all(
      workflowIds.map(async (id) => {
        const analytics = await this.getWorkflowAnalytics(id);
        return {
          id: analytics.workflowId,
          name: analytics.workflowName,
          successRate: analytics.successRate,
          avgExecutionTime: analytics.averageExecutionTime,
          totalExecutions: analytics.totalExecutions,
        };
      })
    );

    const sortedBySuccess = [...workflowStats].sort((a, b) => b.successRate - a.successRate);
    const bestPerformer = sortedBySuccess[0]?.name || 'N/A';
    const worstPerformer = sortedBySuccess[sortedBySuccess.length - 1]?.name || 'N/A';

    return {
      workflows: workflowStats,
      bestPerformer,
      worstPerformer,
    };
  }

  /**
   * Get campaign engagement metrics
   */
  async getCampaignEngagement(workflowId: string): Promise<any> {
    const analytics = await this.getWorkflowAnalytics(workflowId);
    const executions = await this.n8nClient.getExecutions(workflowId);

    // Calculate engagement metrics
    const hourlyDistribution = new Map<number, number>();
    const dayOfWeekDistribution = new Map<number, number>();

    for (const execution of executions) {
      const execDate = new Date(execution.startedAt);
      const hour = execDate.getHours();
      const dayOfWeek = execDate.getDay();

      hourlyDistribution.set(hour, (hourlyDistribution.get(hour) || 0) + 1);
      dayOfWeekDistribution.set(dayOfWeek, (dayOfWeekDistribution.get(dayOfWeek) || 0) + 1);
    }

    // Find peak times
    const peakHour = Array.from(hourlyDistribution.entries()).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0];

    const peakDay = Array.from(dayOfWeekDistribution.entries()).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0];

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return {
      workflowId,
      workflowName: analytics.workflowName,
      totalEngagements: analytics.totalExecutions,
      successRate: analytics.successRate,
      peakHour: `${peakHour}:00`,
      peakDay: dayNames[peakDay],
      hourlyDistribution: Object.fromEntries(hourlyDistribution),
      dayOfWeekDistribution: Object.fromEntries(dayOfWeekDistribution),
    };
  }

  /**
   * Get real-time workflow status
   */
  async getRealTimeStatus(): Promise<any> {
    const workflows = await this.n8nClient.getWorkflows();
    const activeWorkflows = workflows.filter((w) => w.active);

    const status = await Promise.all(
      activeWorkflows.map(async (workflow) => {
        const executions = await this.n8nClient.getExecutions(workflow.id);
        const runningExecutions = executions.filter((e) => e.status === 'running');

        return {
          id: workflow.id,
          name: workflow.name,
          active: workflow.active,
          runningExecutions: runningExecutions.length,
          lastExecution: executions[0]?.startedAt
            ? new Date(executions[0].startedAt)
            : null,
        };
      })
    );

    return {
      totalWorkflows: workflows.length,
      activeWorkflows: activeWorkflows.length,
      workflows: status,
    };
  }

  /**
   * Calculate percentile from sorted array
   */
  private calculatePercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;

    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))];
  }

  /**
   * Export analytics to CSV format
   */
  async exportAnalyticsToCsv(workflowId: string): Promise<string> {
    const analytics = await this.getWorkflowAnalytics(workflowId);
    const performance = await this.getWorkflowPerformance(workflowId);

    let csv = 'Date,Executions,Success Rate,Average Time\n';

    for (const perf of performance) {
      csv += `${perf.date},${perf.executions},${perf.successRate.toFixed(2)},${perf.averageTime.toFixed(2)}\n`;
    }

    return csv;
  }
}
