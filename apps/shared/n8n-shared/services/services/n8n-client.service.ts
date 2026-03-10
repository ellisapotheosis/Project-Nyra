import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { N8nConfig } from '../config/n8n.config';

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  settings?: any;
  tags?: string[];
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  mode: string;
  startedAt: Date;
  stoppedAt?: Date;
  status: 'running' | 'success' | 'error' | 'waiting';
  data?: any;
}

export interface WebhookTriggerData {
  [key: string]: any;
}

export class N8nClientService {
  private client: AxiosInstance;
  private config: N8nConfig;

  constructor(config?: N8nConfig) {
    this.config = config || {
      baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
      apiKey: process.env.N8N_API_KEY || '',
      webhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook',
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'X-N8N-API-KEY': this.config.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[N8N] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[N8N] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[N8N] Response error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get all workflows
   */
  async getWorkflows(): Promise<N8nWorkflow[]> {
    const response = await this.client.get('/api/v1/workflows');
    return response.data.data;
  }

  /**
   * Get a specific workflow by ID
   */
  async getWorkflow(workflowId: string): Promise<N8nWorkflow> {
    const response = await this.client.get(`/api/v1/workflows/${workflowId}`);
    return response.data;
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    const response = await this.client.post('/api/v1/workflows', workflow);
    return response.data;
  }

  /**
   * Update an existing workflow
   */
  async updateWorkflow(
    workflowId: string,
    workflow: Partial<N8nWorkflow>
  ): Promise<N8nWorkflow> {
    const response = await this.client.patch(`/api/v1/workflows/${workflowId}`, workflow);
    return response.data;
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    await this.client.delete(`/api/v1/workflows/${workflowId}`);
  }

  /**
   * Activate a workflow
   */
  async activateWorkflow(workflowId: string): Promise<N8nWorkflow> {
    return this.updateWorkflow(workflowId, { active: true });
  }

  /**
   * Deactivate a workflow
   */
  async deactivateWorkflow(workflowId: string): Promise<N8nWorkflow> {
    return this.updateWorkflow(workflowId, { active: false });
  }

  /**
   * Execute a workflow manually
   */
  async executeWorkflow(workflowId: string, data?: any): Promise<WorkflowExecution> {
    const response = await this.client.post(`/api/v1/workflows/${workflowId}/execute`, {
      data,
    });
    return response.data;
  }

  /**
   * Get workflow executions
   */
  async getExecutions(workflowId?: string): Promise<WorkflowExecution[]> {
    const params: any = {};
    if (workflowId) {
      params.workflowId = workflowId;
    }

    const response = await this.client.get('/api/v1/executions', { params });
    return response.data.data;
  }

  /**
   * Get a specific execution
   */
  async getExecution(executionId: string): Promise<WorkflowExecution> {
    const response = await this.client.get(`/api/v1/executions/${executionId}`);
    return response.data;
  }

  /**
   * Delete an execution
   */
  async deleteExecution(executionId: string): Promise<void> {
    await this.client.delete(`/api/v1/executions/${executionId}`);
  }

  /**
   * Trigger a webhook
   */
  async triggerWebhook(webhookId: string, data: WebhookTriggerData): Promise<any> {
    const webhookUrl = `${this.config.webhookUrl}/${webhookId}`;
    const response = await axios.post(webhookUrl, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  /**
   * Import workflow from JSON
   */
  async importWorkflow(workflowJson: any): Promise<N8nWorkflow> {
    const workflow = JSON.parse(JSON.stringify(workflowJson));
    delete workflow.id; // Remove ID to create new workflow
    return this.createWorkflow(workflow);
  }

  /**
   * Export workflow to JSON
   */
  async exportWorkflow(workflowId: string): Promise<N8nWorkflow> {
    return this.getWorkflow(workflowId);
  }

  /**
   * Get workflow tags
   */
  async getTags(): Promise<string[]> {
    const response = await this.client.get('/api/v1/tags');
    return response.data.data.map((tag: any) => tag.name);
  }

  /**
   * Search workflows by tag
   */
  async getWorkflowsByTag(tag: string): Promise<N8nWorkflow[]> {
    const workflows = await this.getWorkflows();
    return workflows.filter((workflow) => workflow.tags?.includes(tag));
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/healthz');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStats(workflowId: string): Promise<any> {
    const executions = await this.getExecutions(workflowId);

    const stats = {
      totalExecutions: executions.length,
      successCount: executions.filter((e) => e.status === 'success').length,
      errorCount: executions.filter((e) => e.status === 'error').length,
      runningCount: executions.filter((e) => e.status === 'running').length,
      averageExecutionTime: 0,
    };

    const completedExecutions = executions.filter(
      (e) => e.status === 'success' || e.status === 'error'
    );

    if (completedExecutions.length > 0) {
      const totalTime = completedExecutions.reduce((sum, exec) => {
        if (exec.startedAt && exec.stoppedAt) {
          return sum + (new Date(exec.stoppedAt).getTime() - new Date(exec.startedAt).getTime());
        }
        return sum;
      }, 0);

      stats.averageExecutionTime = totalTime / completedExecutions.length;
    }

    return stats;
  }
}
