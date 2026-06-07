import schedule from 'node-schedule';
import { addMinutes, parseISO } from 'date-fns';
import { N8nService } from './n8n.service.js';
import { ActivepiecesService } from './activepieces.service.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

/**
 * Campaign Scheduler Service
 * Manages scheduling and execution of campaign steps
 */
export class CampaignSchedulerService {
  constructor() {
    this.n8nService = new N8nService();
    this.activepiecesService = new ActivepiecesService();
    this.scheduledJobs = new Map(); // executionId -> jobs array
  }

  /**
   * Schedule all steps for a campaign execution
   */
  async scheduleCampaign(campaignExecution, campaign, contact) {
    try {
      const jobs = [];
      const startTime = campaignExecution.startedAt || new Date();

      logger.info('Scheduling campaign', {
        executionId: campaignExecution.id,
        campaignId: campaign.id,
        contactId: contact.id,
        stepCount: campaign.steps.length
      });

      for (let i = 0; i < campaign.steps.length; i++) {
        const step = campaign.steps[i];
        const executionStep = campaignExecution.steps[i];

        // Calculate scheduled time
        const scheduledFor = this.calculateScheduledTime(startTime, step);
        executionStep.scheduledFor = scheduledFor;
        executionStep.status = 'scheduled';

        // Schedule the job
        const job = schedule.scheduleJob(scheduledFor, async () => {
          await this.executeStep(campaignExecution, step, executionStep, contact);
        });

        jobs.push({
          stepId: executionStep.stepId,
          job,
          scheduledFor
        });

        logger.info('Step scheduled', {
          executionId: campaignExecution.id,
          stepId: executionStep.stepId,
          scheduledFor,
          channel: step.channel
        });
      }

      this.scheduledJobs.set(campaignExecution.id, jobs);

      return {
        success: true,
        scheduledCount: jobs.length
      };
    } catch (error) {
      logger.error('Error scheduling campaign', {
        error: error.message,
        executionId: campaignExecution.id
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Schedule only unfinished steps after a paused execution is resumed.
   */
  async scheduleRemainingSteps(campaignExecution, campaign, contact) {
    try {
      const jobs = [];
      const now = new Date();
      const startTime = campaignExecution.startedAt || now;

      for (let i = 0; i < campaign.steps.length; i++) {
        const step = campaign.steps[i];
        const executionStep = campaignExecution.steps[i];

        if (!executionStep || executionStep.isCompleted?.() || ['sent', 'delivered', 'skipped'].includes(executionStep.status)) {
          continue;
        }

        let scheduledFor = this.calculateScheduledTime(startTime, step);
        if (scheduledFor <= now) {
          scheduledFor = now;
        }

        executionStep.scheduledFor = scheduledFor;
        executionStep.status = 'scheduled';

        const job = schedule.scheduleJob(scheduledFor, async () => {
          await this.executeStep(campaignExecution, step, executionStep, contact);
        });

        jobs.push({
          stepId: executionStep.stepId,
          job,
          scheduledFor
        });
      }

      this.scheduledJobs.set(campaignExecution.id, jobs);

      logger.info('Remaining campaign steps scheduled', {
        executionId: campaignExecution.id,
        scheduledCount: jobs.length
      });

      return {
        success: true,
        scheduledCount: jobs.length
      };
    } catch (error) {
      logger.error('Error scheduling remaining campaign steps', {
        error: error.message,
        executionId: campaignExecution.id
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Execute a single campaign step
   */
  async executeStep(execution, step, executionStep, contact) {
    try {
      logger.info('Executing campaign step', {
        executionId: execution.id,
        stepId: executionStep.stepId,
        channel: step.channel
      });

      // Prepare message data
      const messageData = {
        channel: step.channel,
        to: this.getContactChannel(contact, step.channel),
        body: this.personalizeMessage(step.body, contact),
        subject: step.subject ? this.personalizeMessage(step.subject, contact) : null,
        campaignId: execution.campaignId,
        executionId: execution.id,
        stepId: executionStep.stepId,
        contactId: contact.id
      };

      // Send via n8n
      const result = await this.n8nService.sendMessage(messageData);

      if (result.success) {
        executionStep.status = 'sent';
        executionStep.sentAt = new Date();
        executionStep.messageId = result.messageId;

        logger.info('Step executed successfully', {
          executionId: execution.id,
          stepId: executionStep.stepId,
          messageId: result.messageId
        });
      } else {
        executionStep.status = 'failed';
        executionStep.failedAt = new Date();
        executionStep.failureReason = result.error;

        logger.error('Step execution failed', {
          executionId: execution.id,
          stepId: executionStep.stepId,
          error: result.error
        });

        // Retry logic
        if (executionStep.canRetry(config.campaign.maxRetries)) {
          await this.retryStep(execution, step, executionStep, contact);
        }
      }

      return result;
    } catch (error) {
      logger.error('Error executing step', {
        error: error.message,
        executionId: execution.id,
        stepId: executionStep.stepId
      });

      executionStep.status = 'failed';
      executionStep.failedAt = new Date();
      executionStep.failureReason = error.message;

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Retry a failed step
   */
  async retryStep(execution, step, executionStep, contact) {
    executionStep.retryCount += 1;

    const retryDelay = config.campaign.retryDelayMinutes * 60 * 1000;
    const retryTime = new Date(Date.now() + retryDelay);

    logger.info('Scheduling step retry', {
      executionId: execution.id,
      stepId: executionStep.stepId,
      retryCount: executionStep.retryCount,
      retryTime
    });

    setTimeout(async () => {
      await this.executeStep(execution, step, executionStep, contact);
    }, retryDelay);
  }

  /**
   * Cancel all scheduled jobs for an execution
   */
  cancelExecution(executionId) {
    const jobs = this.scheduledJobs.get(executionId);

    if (!jobs) {
      logger.warn('No scheduled jobs found', { executionId });
      return { success: false, error: 'No scheduled jobs found' };
    }

    let canceledCount = 0;
    for (const { job, stepId } of jobs) {
      if (job) {
        job.cancel();
        canceledCount++;
        logger.info('Job canceled', { executionId, stepId });
      }
    }

    this.scheduledJobs.delete(executionId);

    logger.info('Execution canceled', { executionId, canceledCount });

    return {
      success: true,
      canceledCount
    };
  }

  /**
   * Pause execution (cancel remaining jobs)
   */
  pauseExecution(executionId) {
    return this.cancelExecution(executionId);
  }

  /**
   * Calculate scheduled time for a step
   */
  calculateScheduledTime(startTime, step) {
    const absoluteMinutes = typeof step.getAbsoluteMinutes === 'function'
      ? step.getAbsoluteMinutes()
      : ((step.day - 1) * 24 * 60) + (step.offset_minutes || 0);
    return addMinutes(parseISO(startTime.toISOString()), absoluteMinutes);
  }

  /**
   * Get contact channel (email or phone)
   */
  getContactChannel(contact, channel) {
    if (channel === 'email') {
      return contact.email || contact.contactEmail;
    }
    if (channel === 'sms' || channel === 'voicemail') {
      return contact.phone || contact.contactPhone || contact.mobile;
    }
    return contact.email;
  }

  /**
   * Personalize message with contact data
   */
  personalizeMessage(template, contact) {
    if (!template) return '';

    let message = template;

    // Replace common placeholders
    const replacements = {
      'Person first name': contact.firstName || contact.name?.split(' ')[0] || 'there',
      'Person email': contact.email || contact.contactEmail || '[email]',
      'My name with WestCap': contact.assignedLO || 'Your Loan Officer',
      'Email signature': `\n\nBest regards,\n${contact.assignedLO || 'Your Loan Officer'}`
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      const regex = new RegExp(placeholder, 'gi');
      message = message.replace(regex, value);
    }

    return message;
  }

  /**
   * Get scheduled jobs for an execution
   */
  getScheduledJobs(executionId) {
    const jobs = this.scheduledJobs.get(executionId);
    if (!jobs) return [];

    return jobs.map(({ stepId, scheduledFor }) => ({
      stepId,
      scheduledFor,
      isPending: scheduledFor > new Date()
    }));
  }

  /**
   * Get all active executions
   */
  getActiveExecutions() {
    return Array.from(this.scheduledJobs.keys());
  }
}
