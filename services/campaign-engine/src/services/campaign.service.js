import { v4 as uuidv4 } from 'uuid';
import { Campaign } from '../models/campaign.model.js';
import { CampaignExecution, ExecutionStep } from '../models/campaign-execution.model.js';
import { CampaignSchedulerService } from './campaign-scheduler.service.js';
import { GuardrailMiddleware } from '../middleware/guardrails.middleware.js';
import { logger } from '../utils/logger.js';

/**
 * Campaign Service
 * Core business logic for campaign management
 */
export class CampaignService {
  constructor() {
    this.campaigns = new Map(); // In-memory storage (replace with DB)
    this.executions = new Map(); // In-memory storage (replace with DB)
    this.scheduler = new CampaignSchedulerService();
  }

  /**
   * Create or update a campaign
   */
  async saveCampaign(campaignData) {
    try {
      const campaign = new Campaign(campaignData);
      const validation = campaign.validate();

      if (!validation.valid) {
        logger.error('Campaign validation failed', { errors: validation.errors });
        return {
          success: false,
          errors: validation.errors
        };
      }

      this.campaigns.set(campaign.id, campaign);

      logger.info('Campaign saved', {
        id: campaign.id,
        name: campaign.name,
        stepCount: campaign.steps.length
      });

      return {
        success: true,
        campaign: campaign.toJSON()
      };
    } catch (error) {
      logger.error('Error saving campaign', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get campaign by ID
   */
  async getCampaign(campaignId) {
    const campaign = this.campaigns.get(campaignId);

    if (!campaign) {
      return {
        success: false,
        error: 'Campaign not found'
      };
    }

    return {
      success: true,
      campaign: campaign.toJSON()
    };
  }

  /**
   * List all campaigns
   */
  async listCampaigns(filters = {}) {
    let campaigns = Array.from(this.campaigns.values());

    // Apply filters
    if (filters.status) {
      campaigns = campaigns.filter(c => c.status === filters.status);
    }

    return {
      success: true,
      campaigns: campaigns.map(c => c.toJSON()),
      total: campaigns.length
    };
  }

  /**
   * Start a campaign for a contact
   */
  async startCampaignExecution(campaignId, contact) {
    try {
      const campaignResult = await this.getCampaign(campaignId);
      if (!campaignResult.success) {
        return campaignResult;
      }

      const campaign = Campaign.fromJSON(campaignResult.campaign);

      // Check compliance
      const dncCheck = await GuardrailMiddleware.checkDNC(contact);
      if (!dncCheck.allowed) {
        return {
          success: false,
          error: 'Contact is on DNC list'
        };
      }

      // Create execution
      const execution = new CampaignExecution({
        id: uuidv4(),
        campaignId: campaign.id,
        contactId: contact.id,
        leadId: contact.leadId,
        status: 'active',
        startedAt: new Date(),
        steps: campaign.steps.map((step, index) => new ExecutionStep({
          stepId: `${campaign.id}_step_${index}`,
          day: step.day,
          channel: step.channel,
          status: 'pending'
        })),
        metadata: {
          contactName: `${contact.firstName} ${contact.lastName}`,
          campaignName: campaign.name,
          contactSnapshot: contact
        }
      });

      this.executions.set(execution.id, execution);

      // Schedule all steps
      await this.scheduler.scheduleCampaign(execution, campaign, contact);

      logger.info('Campaign execution started', {
        executionId: execution.id,
        campaignId: campaign.id,
        contactId: contact.id
      });

      GuardrailMiddleware.logComplianceEvent({
        type: 'CAMPAIGN_STARTED',
        contactId: contact.id,
        campaignId: campaign.id,
        action: 'start_execution'
      });

      return {
        success: true,
        execution: execution.toJSON()
      };
    } catch (error) {
      logger.error('Error starting campaign execution', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Pause campaign execution
   */
  async pauseExecution(executionId) {
    const execution = this.executions.get(executionId);

    if (!execution) {
      return {
        success: false,
        error: 'Execution not found'
      };
    }

    execution.status = 'paused';
    execution.pausedAt = new Date();

    // Cancel scheduled jobs
    this.scheduler.pauseExecution(executionId);

    logger.info('Campaign execution paused', { executionId });

    return {
      success: true,
      execution: execution.toJSON()
    };
  }

  /**
   * Resume campaign execution
   */
  async resumeExecution(executionId) {
    const execution = this.executions.get(executionId);

    if (!execution) {
      return {
        success: false,
        error: 'Execution not found'
      };
    }

    if (execution.status !== 'paused') {
      return {
        success: false,
        error: 'Execution is not paused'
      };
    }

    execution.status = 'active';
    execution.pausedAt = null;

    const campaignResult = await this.getCampaign(execution.campaignId);
    if (!campaignResult.success) {
      return campaignResult;
    }

    const campaign = Campaign.fromJSON(campaignResult.campaign);
    const contact = execution.metadata?.contactSnapshot;
    if (!contact) {
      return {
        success: false,
        error: 'Cannot resume execution without contact snapshot'
      };
    }

    const scheduleResult = await this.scheduler.scheduleRemainingSteps(execution, campaign, contact);
    if (!scheduleResult.success) {
      execution.status = 'paused';
      execution.pausedAt = new Date();
      return scheduleResult;
    }

    logger.info('Campaign execution resumed', { executionId });

    return {
      success: true,
      execution: execution.toJSON()
    };
  }

  /**
   * Stop campaign execution
   */
  async stopExecution(executionId) {
    const execution = this.executions.get(executionId);

    if (!execution) {
      return {
        success: false,
        error: 'Execution not found'
      };
    }

    execution.status = 'completed';
    execution.completedAt = new Date();

    // Cancel scheduled jobs
    this.scheduler.cancelExecution(executionId);

    logger.info('Campaign execution stopped', { executionId });

    return {
      success: true,
      execution: execution.toJSON()
    };
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId) {
    const execution = this.executions.get(executionId);

    if (!execution) {
      return {
        success: false,
        error: 'Execution not found'
      };
    }

    const scheduledJobs = this.scheduler.getScheduledJobs(executionId);

    return {
      success: true,
      execution: execution.toJSON(),
      scheduledJobs
    };
  }

  /**
   * List executions with filters
   */
  async listExecutions(filters = {}) {
    let executions = Array.from(this.executions.values());

    if (filters.campaignId) {
      executions = executions.filter(e => e.campaignId === filters.campaignId);
    }

    if (filters.contactId) {
      executions = executions.filter(e => e.contactId === filters.contactId);
    }

    if (filters.status) {
      executions = executions.filter(e => e.status === filters.status);
    }

    return {
      success: true,
      executions: executions.map(e => e.toJSON()),
      total: executions.length
    };
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(campaignId) {
    const executions = Array.from(this.executions.values())
      .filter(e => e.campaignId === campaignId);

    const stats = {
      totalExecutions: executions.length,
      active: executions.filter(e => e.status === 'active').length,
      paused: executions.filter(e => e.status === 'paused').length,
      completed: executions.filter(e => e.status === 'completed').length,
      failed: executions.filter(e => e.status === 'failed').length,
      averageProgress: 0,
      totalSteps: 0,
      completedSteps: 0
    };

    executions.forEach(e => {
      stats.totalSteps += e.steps.length;
      stats.completedSteps += e.steps.filter(s => s.isCompleted()).length;
    });

    if (stats.totalSteps > 0) {
      stats.averageProgress = Math.round((stats.completedSteps / stats.totalSteps) * 100);
    }

    return {
      success: true,
      stats
    };
  }
}
