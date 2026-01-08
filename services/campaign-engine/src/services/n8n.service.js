import axios from 'axios';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

/**
 * n8n Integration Service
 * Handles scheduling and workflow triggers via n8n
 */
export class N8nService {
  constructor() {
    this.baseUrl = config.n8n.baseUrl;
    this.apiKey = config.n8n.apiKey;
    this.webhookUrl = config.n8n.webhookUrl;

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-N8N-API-KEY': this.apiKey })
      }
    });
  }

  /**
   * Send message via n8n webhook
   */
  async sendMessage(data) {
    try {
      const payload = {
        channel: data.channel,
        to: data.to,
        body: data.body,
        subject: data.subject || null,
        metadata: {
          campaignId: data.campaignId,
          executionId: data.executionId,
          stepId: data.stepId,
          contactId: data.contactId,
          sentAt: new Date().toISOString()
        }
      };

      logger.info('Sending message via n8n', {
        channel: data.channel,
        to: this.maskContact(data.to)
      });

      const response = await axios.post(this.webhookUrl, payload);

      logger.info('Message sent successfully via n8n', {
        channel: data.channel,
        messageId: response.data?.messageId
      });

      return {
        success: true,
        messageId: response.data?.messageId || response.data?.id,
        response: response.data
      };
    } catch (error) {
      logger.error('Error sending message via n8n', {
        error: error.message,
        channel: data.channel
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create scheduled workflow execution
   */
  async scheduleExecution(data) {
    try {
      const payload = {
        workflowId: data.workflowId || 'nyra_dispatch_workflow',
        scheduledFor: data.scheduledFor,
        data: {
          channel: data.channel,
          to: data.to,
          body: data.body,
          subject: data.subject,
          metadata: data.metadata
        }
      };

      logger.info('Scheduling n8n workflow execution', {
        workflowId: payload.workflowId,
        scheduledFor: data.scheduledFor
      });

      // Note: n8n doesn't have native scheduling API, we'll use node-schedule
      // in the campaign scheduler service
      return {
        success: true,
        scheduled: true,
        scheduledFor: data.scheduledFor
      };
    } catch (error) {
      logger.error('Error scheduling n8n execution', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get workflow status
   */
  async getWorkflowStatus(workflowId) {
    try {
      const response = await this.client.get(`/workflows/${workflowId}`);
      return {
        success: true,
        workflow: response.data
      };
    } catch (error) {
      logger.error('Error getting workflow status', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get execution history
   */
  async getExecutionHistory(workflowId, limit = 10) {
    try {
      const response = await this.client.get(`/executions`, {
        params: {
          workflowId,
          limit
        }
      });

      return {
        success: true,
        executions: response.data?.data || []
      };
    } catch (error) {
      logger.error('Error getting execution history', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test n8n connection
   */
  async testConnection() {
    try {
      // Try to hit the webhook URL with a test payload
      await axios.post(this.webhookUrl, {
        channel: 'test',
        to: 'test@example.com',
        body: 'Connection test',
        metadata: { test: true }
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Mask contact information for logging
   */
  maskContact(contact) {
    if (!contact) return 'unknown';
    if (contact.includes('@')) {
      const [local, domain] = contact.split('@');
      return `${local.substring(0, 2)}***@${domain}`;
    }
    return `***${contact.slice(-4)}`;
  }
}
