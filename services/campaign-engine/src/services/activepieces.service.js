import axios from 'axios';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

/**
 * Activepieces Integration Service
 * Handles message delivery via Activepieces flows
 */
export class ActivepiecesService {
  constructor() {
    this.baseUrl = config.activepieces.baseUrl;
    this.apiKey = config.activepieces.apiKey;

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      }
    });
  }

  /**
   * Send message via Activepieces flow
   */
  async sendMessage(data) {
    try {
      const payload = {
        flowId: data.flowId || 'campaign-message-sender',
        input: {
          channel: data.channel,
          recipient: data.to,
          message: data.body,
          subject: data.subject || null,
          metadata: {
            campaignId: data.campaignId,
            executionId: data.executionId,
            stepId: data.stepId,
            contactId: data.contactId,
            timestamp: new Date().toISOString()
          }
        }
      };

      logger.info('Sending message via Activepieces', {
        flowId: payload.flowId,
        channel: data.channel,
        recipient: this.maskContact(data.to)
      });

      const response = await this.client.post('/v1/flows/trigger', payload);

      logger.info('Message sent successfully via Activepieces', {
        channel: data.channel,
        runId: response.data?.runId
      });

      return {
        success: true,
        runId: response.data?.runId,
        messageId: response.data?.messageId,
        response: response.data
      };
    } catch (error) {
      logger.error('Error sending message via Activepieces', {
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
   * Create scheduled message flow
   */
  async scheduleMessage(data) {
    try {
      const payload = {
        flowId: data.flowId || 'campaign-scheduler',
        schedule: {
          type: 'cron',
          cronExpression: this.createCronExpression(data.scheduledFor)
        },
        input: {
          channel: data.channel,
          recipient: data.to,
          message: data.body,
          subject: data.subject,
          metadata: data.metadata
        }
      };

      logger.info('Scheduling message via Activepieces', {
        scheduledFor: data.scheduledFor
      });

      const response = await this.client.post('/v1/flows/schedule', payload);

      return {
        success: true,
        scheduleId: response.data?.scheduleId,
        scheduledFor: data.scheduledFor
      };
    } catch (error) {
      logger.error('Error scheduling message via Activepieces', {
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get flow run status
   */
  async getRunStatus(runId) {
    try {
      const response = await this.client.get(`/v1/flows/runs/${runId}`);
      return {
        success: true,
        run: response.data
      };
    } catch (error) {
      logger.error('Error getting run status', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancel scheduled message
   */
  async cancelSchedule(scheduleId) {
    try {
      await this.client.delete(`/v1/flows/schedules/${scheduleId}`);

      logger.info('Schedule canceled successfully', { scheduleId });

      return { success: true };
    } catch (error) {
      logger.error('Error canceling schedule', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test Activepieces connection
   */
  async testConnection() {
    try {
      const response = await this.client.get('/v1/health');
      return {
        success: true,
        status: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create cron expression from date
   */
  createCronExpression(date) {
    const d = new Date(date);
    const minute = d.getMinutes();
    const hour = d.getHours();
    const dayOfMonth = d.getDate();
    const month = d.getMonth() + 1;

    return `${minute} ${hour} ${dayOfMonth} ${month} *`;
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
