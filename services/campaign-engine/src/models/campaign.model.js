/**
 * Campaign Model
 * Represents a campaign configuration with steps and metadata
 */

export class Campaign {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description || '';
    this.timezone = data.timezone || 'America/Los_Angeles';
    this.version = data.version || '1.0';
    this.status = data.status || 'draft'; // draft, active, paused, completed
    this.steps = data.steps || [];
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Validate campaign structure
   */
  validate() {
    const errors = [];

    if (!this.id) errors.push('Campaign ID is required');
    if (!this.name) errors.push('Campaign name is required');
    if (!Array.isArray(this.steps) || this.steps.length === 0) {
      errors.push('Campaign must have at least one step');
    }

    // Validate each step
    this.steps.forEach((step, index) => {
      if (!step.day || step.day < 1) {
        errors.push(`Step ${index}: Invalid day number`);
      }
      if (!['sms', 'email', 'voicemail'].includes(step.channel)) {
        errors.push(`Step ${index}: Invalid channel (${step.channel})`);
      }
      if (step.offset_minutes === undefined || step.offset_minutes === null) {
        errors.push(`Step ${index}: offset_minutes is required`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      timezone: this.timezone,
      version: this.version,
      status: this.status,
      steps: this.steps,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Create from JSON data
   */
  static fromJSON(data) {
    return new Campaign(data);
  }
}

export class CampaignStep {
  constructor(data) {
    this.day = data.day;
    this.channel = data.channel; // sms, email, voicemail
    this.label = data.label || '';
    this.offset_minutes = data.offset_minutes;
    this.raw_time = data.raw_time || '';
    this.body = data.body || '';
    this.subject = data.subject || null; // For emails
    this.metadata = data.metadata || {};
  }

  /**
   * Calculate absolute time from campaign start
   */
  getAbsoluteMinutes() {
    const dayMinutes = (this.day - 1) * 24 * 60;
    return dayMinutes + (this.offset_minutes || 0);
  }

  toJSON() {
    return {
      day: this.day,
      channel: this.channel,
      label: this.label,
      offset_minutes: this.offset_minutes,
      raw_time: this.raw_time,
      body: this.body,
      subject: this.subject,
      metadata: this.metadata
    };
  }
}
