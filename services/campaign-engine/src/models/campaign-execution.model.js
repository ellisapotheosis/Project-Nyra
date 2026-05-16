/**
 * Campaign Execution Model
 * Tracks execution of a campaign for a specific lead/contact
 */

export class CampaignExecution {
  constructor(data) {
    this.id = data.id;
    this.campaignId = data.campaignId;
    this.contactId = data.contactId;
    this.leadId = data.leadId || null;
    this.status = data.status || 'pending'; // pending, active, paused, replied, stopped, completed, failed
    this.currentStep = data.currentStep || 0;
    this.startedAt = data.startedAt || null;
    this.completedAt = data.completedAt || null;
    this.stoppedAt = data.stoppedAt || null;
    this.pausedAt = data.pausedAt || null;
    this.steps = data.steps || [];
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Check if execution is active
   */
  isActive() {
    return this.status === 'active';
  }

  /**
   * Check if execution is completed
   */
  isCompleted() {
    return this.status === 'completed' || this.completedAt !== null;
  }

  /**
   * Check if execution cannot be resumed.
   */
  isTerminal() {
    return ['stopped', 'completed'].includes(this.status);
  }

  /**
   * Get next pending step
   */
  getNextStep() {
    return this.steps.find(s => s.status === 'pending');
  }

  /**
   * Get progress percentage
   */
  getProgress() {
    if (!this.steps || this.steps.length === 0) return 0;
    const completed = this.steps.filter(s => s.status === 'completed').length;
    return Math.round((completed / this.steps.length) * 100);
  }

  toJSON() {
    return {
      id: this.id,
      campaignId: this.campaignId,
      contactId: this.contactId,
      leadId: this.leadId,
      status: this.status,
      currentStep: this.currentStep,
      progress: this.getProgress(),
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      stoppedAt: this.stoppedAt,
      pausedAt: this.pausedAt,
      steps: this.steps,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export class ExecutionStep {
  constructor(data) {
    this.stepId = data.stepId;
    this.day = data.day;
    this.channel = data.channel;
    this.status = data.status || 'pending'; // pending, scheduled, sent, delivered, failed, skipped
    this.scheduledFor = data.scheduledFor || null;
    this.sentAt = data.sentAt || null;
    this.deliveredAt = data.deliveredAt || null;
    this.failedAt = data.failedAt || null;
    this.failureReason = data.failureReason || null;
    this.retryCount = data.retryCount || 0;
    this.messageId = data.messageId || null; // External message ID from n8n/Activepieces
    this.metadata = data.metadata || {};
  }

  isCompleted() {
    return ['sent', 'delivered'].includes(this.status);
  }

  canRetry(maxRetries = 3) {
    return this.status === 'failed' && this.retryCount < maxRetries;
  }

  toJSON() {
    return {
      stepId: this.stepId,
      day: this.day,
      channel: this.channel,
      status: this.status,
      scheduledFor: this.scheduledFor,
      sentAt: this.sentAt,
      deliveredAt: this.deliveredAt,
      failedAt: this.failedAt,
      failureReason: this.failureReason,
      retryCount: this.retryCount,
      messageId: this.messageId,
      metadata: this.metadata
    };
  }
}
