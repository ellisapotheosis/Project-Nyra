import { N8nClientService, WebhookTriggerData } from './n8n-client.service';
import fs from 'fs';
import path from 'path';

export interface TriggerOptions {
  workflowType: 'email' | 'sms' | 'lead-nurturing' | 'application-reminder' | 'document-request' | 'rate-update';
  data: any;
  scheduleDelay?: number; // Delay in milliseconds
}

export interface WorkflowTemplate {
  type: string;
  webhookId: string;
  workflowId?: string;
  name: string;
  description: string;
}

export class WorkflowTriggerService {
  private n8nClient: N8nClientService;
  private workflowTemplates: Map<string, WorkflowTemplate>;
  private workflowsDir: string;

  constructor(n8nClient?: N8nClientService) {
    this.n8nClient = n8nClient || new N8nClientService();
    this.workflowTemplates = new Map();
    this.workflowsDir = path.join(__dirname, '..', 'workflows');
    this.loadWorkflowTemplates();
  }

  /**
   * Load workflow templates from JSON files
   */
  private loadWorkflowTemplates(): void {
    const templates: WorkflowTemplate[] = [
      {
        type: 'email',
        webhookId: 'mortgage-email-drip',
        name: 'Mortgage Email Drip Campaign',
        description: 'Email drip sequence for mortgage leads',
      },
      {
        type: 'sms',
        webhookId: 'mortgage-sms-drip',
        name: 'Mortgage SMS Drip Campaign',
        description: 'SMS drip sequence for mortgage leads',
      },
      {
        type: 'lead-nurturing',
        webhookId: 'lead-nurturing',
        name: 'Lead Nurturing Workflow',
        description: 'Automated lead scoring and nurturing',
      },
      {
        type: 'application-reminder',
        webhookId: 'application-reminder',
        name: 'Application Reminder Workflow',
        description: 'Reminders for incomplete applications',
      },
      {
        type: 'document-request',
        webhookId: 'document-request',
        name: 'Document Request Workflow',
        description: 'Automated document request and follow-up',
      },
      {
        type: 'rate-update',
        webhookId: 'rate-update',
        name: 'Rate Update Notification Workflow',
        description: 'Notify subscribers of rate changes',
      },
    ];

    templates.forEach((template) => {
      this.workflowTemplates.set(template.type, template);
    });
  }

  /**
   * Trigger email drip campaign
   */
  async triggerEmailDrip(leadData: {
    leadId: string;
    email: string;
    firstName: string;
    dayInSequence: number;
    portalUrl: string;
  }): Promise<any> {
    const template = this.workflowTemplates.get('email');
    if (!template) {
      throw new Error('Email drip workflow template not found');
    }

    return this.n8nClient.triggerWebhook(template.webhookId, leadData);
  }

  /**
   * Trigger SMS drip campaign
   */
  async triggerSmsDrip(leadData: {
    leadId: string;
    phoneNumber: string;
    firstName: string;
    dayInSequence: number;
    smsOptIn: boolean;
    currentRate?: string;
    portalUrl: string;
  }): Promise<any> {
    const template = this.workflowTemplates.get('sms');
    if (!template) {
      throw new Error('SMS drip workflow template not found');
    }

    if (!leadData.smsOptIn) {
      throw new Error('Lead has not opted in to SMS communications');
    }

    return this.n8nClient.triggerWebhook(template.webhookId, leadData);
  }

  /**
   * Trigger lead nurturing workflow
   */
  async triggerLeadNurturing(): Promise<any> {
    const template = this.workflowTemplates.get('lead-nurturing');
    if (!template) {
      throw new Error('Lead nurturing workflow template not found');
    }

    // This workflow runs on a schedule, so we just trigger it manually
    if (template.workflowId) {
      return this.n8nClient.executeWorkflow(template.workflowId);
    }

    throw new Error('Lead nurturing workflow ID not configured');
  }

  /**
   * Trigger application reminder workflow
   */
  async triggerApplicationReminder(): Promise<any> {
    const template = this.workflowTemplates.get('application-reminder');
    if (!template) {
      throw new Error('Application reminder workflow template not found');
    }

    if (template.workflowId) {
      return this.n8nClient.executeWorkflow(template.workflowId);
    }

    throw new Error('Application reminder workflow ID not configured');
  }

  /**
   * Trigger document request workflow
   */
  async triggerDocumentRequest(applicationData: {
    applicationId: string;
    email: string;
    firstName: string;
    uploadedDocuments: any[];
    uploadUrl: string;
    loanOfficer: string;
    loanOfficerPhone: string;
    loanOfficerEmail: string;
    smsOptIn?: boolean;
    phoneNumber?: string;
  }): Promise<any> {
    const template = this.workflowTemplates.get('document-request');
    if (!template) {
      throw new Error('Document request workflow template not found');
    }

    return this.n8nClient.triggerWebhook(template.webhookId, applicationData);
  }

  /**
   * Trigger rate update notification workflow
   */
  async triggerRateUpdate(): Promise<any> {
    const template = this.workflowTemplates.get('rate-update');
    if (!template) {
      throw new Error('Rate update workflow template not found');
    }

    if (template.workflowId) {
      return this.n8nClient.executeWorkflow(template.workflowId);
    }

    throw new Error('Rate update workflow ID not configured');
  }

  /**
   * Generic workflow trigger
   */
  async triggerWorkflow(options: TriggerOptions): Promise<any> {
    const { workflowType, data, scheduleDelay } = options;

    if (scheduleDelay && scheduleDelay > 0) {
      // Schedule for later execution
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const result = await this.executeTrigger(workflowType, data);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, scheduleDelay);
      });
    }

    return this.executeTrigger(workflowType, data);
  }

  /**
   * Execute trigger based on workflow type
   */
  private async executeTrigger(workflowType: string, data: any): Promise<any> {
    switch (workflowType) {
      case 'email':
        return this.triggerEmailDrip(data);
      case 'sms':
        return this.triggerSmsDrip(data);
      case 'lead-nurturing':
        return this.triggerLeadNurturing();
      case 'application-reminder':
        return this.triggerApplicationReminder();
      case 'document-request':
        return this.triggerDocumentRequest(data);
      case 'rate-update':
        return this.triggerRateUpdate();
      default:
        throw new Error(`Unknown workflow type: ${workflowType}`);
    }
  }

  /**
   * Deploy workflow templates to n8n
   */
  async deployWorkflowTemplates(): Promise<void> {
    const workflowFiles = [
      'email-drip.json',
      'sms-drip.json',
      'lead-nurturing.json',
      'application-reminder.json',
      'document-request.json',
      'rate-update.json',
    ];

    for (const file of workflowFiles) {
      const filePath = path.join(this.workflowsDir, file);

      if (!fs.existsSync(filePath)) {
        console.warn(`Workflow file not found: ${filePath}`);
        continue;
      }

      const workflowJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const workflowType = file.replace('.json', '');

      try {
        // Check if workflow already exists
        const existingWorkflows = await this.n8nClient.getWorkflows();
        const existing = existingWorkflows.find((w) => w.name === workflowJson.name);

        let workflow;
        if (existing) {
          console.log(`Updating existing workflow: ${workflowJson.name}`);
          workflow = await this.n8nClient.updateWorkflow(existing.id, workflowJson);
        } else {
          console.log(`Creating new workflow: ${workflowJson.name}`);
          workflow = await this.n8nClient.importWorkflow(workflowJson);
        }

        // Update template with workflow ID
        const template = this.workflowTemplates.get(workflowType);
        if (template) {
          template.workflowId = workflow.id;
          this.workflowTemplates.set(workflowType, template);
        }

        console.log(`Successfully deployed: ${workflowJson.name} (ID: ${workflow.id})`);
      } catch (error) {
        console.error(`Error deploying workflow ${file}:`, error);
      }
    }
  }

  /**
   * Get all workflow templates
   */
  getWorkflowTemplates(): WorkflowTemplate[] {
    return Array.from(this.workflowTemplates.values());
  }

  /**
   * Get specific workflow template
   */
  getWorkflowTemplate(type: string): WorkflowTemplate | undefined {
    return this.workflowTemplates.get(type);
  }
}
