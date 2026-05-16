import mammoth from 'mammoth';
import { Campaign, CampaignStep } from '../models/campaign.model.js';
import { logger } from '../utils/logger.js';

/**
 * Parse campaign data from DOCX files
 */
export class DocxCampaignParser {
  /**
   * Parse DOCX file and extract campaign structure
   */
  async parseFile(filePath) {
    try {
      logger.info(`Parsing DOCX file: ${filePath}`);

      const result = await mammoth.extractRawText({ path: filePath });
      const text = result.value;

      return this.parseText(text, filePath);
    } catch (error) {
      logger.error('Error parsing DOCX file', { filePath, error: error.message });
      throw new Error(`Failed to parse DOCX file: ${error.message}`);
    }
  }

  /**
   * Parse text content and extract campaign steps
   */
  parseText(text, source = 'unknown') {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    const campaignName = this.extractCampaignName(lines);
    const steps = this.extractSteps(lines);

    const campaign = new Campaign({
      id: this.generateCampaignId(campaignName),
      name: campaignName,
      description: `Parsed from ${source}`,
      steps: steps,
      metadata: {
        source: source,
        parsedAt: new Date().toISOString()
      }
    });

    const validation = campaign.validate();
    if (!validation.valid) {
      logger.warn('Campaign validation warnings', { errors: validation.errors });
    }

    logger.info(`Parsed campaign: ${campaignName} with ${steps.length} steps`);
    return campaign;
  }

  /**
   * Extract campaign name from first line or content
   */
  extractCampaignName(lines) {
    const firstLine = lines[0] || '';
    if (firstLine.toLowerCase().includes('campaign')) {
      return firstLine.replace(/:/g, ' ').replace(/\s+/g, ' ').trim();
    }

    // Look for "Day X-Y" pattern
    const dayRangeMatch = firstLine.match(/Day\s+(\d+)\s*[-to]+\s*(\d+)/i);
    if (dayRangeMatch) {
      return `Campaign Day ${dayRangeMatch[1]}-${dayRangeMatch[2]}`;
    }

    return 'Unnamed Campaign';
  }

  /**
   * Extract steps from text content
   */
  extractSteps(lines) {
    const steps = [];
    let currentDay = 1;
    let currentChannel = null;
    let currentBody = [];
    let currentOffset = 0;
    let currentRawTime = 'instant';
    let currentLabel = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect day header
      const dayMatch = line.match(/^Day\s+(\d+)\s*$/i);
      if (dayMatch) {
        // Save previous step if exists
        if (currentChannel && currentBody.length > 0) {
          steps.push(this.createStep({
            day: currentDay,
            channel: currentChannel,
            label: currentLabel,
            offset_minutes: currentOffset,
            raw_time: currentRawTime,
            body: currentBody.join('\n').trim()
          }));
          currentBody = [];
        }

        currentDay = parseInt(dayMatch[1]);
        continue;
      }

      // Detect channel and timing
      const channelMatch = line.match(/(SMS|Email|Vmail|VMail|VoiceMail)\s*(\d+)?\s*Time:\s*(.+)/i);
      if (channelMatch) {
        // Save previous step if exists
        if (currentChannel && currentBody.length > 0) {
          steps.push(this.createStep({
            day: currentDay,
            channel: currentChannel,
            label: currentLabel,
            offset_minutes: currentOffset,
            raw_time: currentRawTime,
            body: currentBody.join('\n').trim()
          }));
          currentBody = [];
        }

        const channel = channelMatch[1].toLowerCase();
        currentChannel = channel === 'vmail' || channel === 'voicemail' ? 'voicemail' : channel;
        currentLabel = channelMatch[2] ? `${currentChannel}${channelMatch[2]}` : currentChannel;
        currentRawTime = channelMatch[3].trim();
        currentOffset = this.parseTimeOffset(currentRawTime);
        continue;
      }

      // Collect body content
      if (currentChannel) {
        // Skip metadata lines
        if (line.startsWith('***') || line.toLowerCase().includes('insert your')) {
          continue;
        }

        // Extract subject for emails
        if (currentChannel === 'email' && line.toLowerCase().startsWith('subject')) {
          currentBody.push(line);
        } else if (line.length > 0) {
          currentBody.push(line);
        }
      }
    }

    // Save final step
    if (currentChannel && currentBody.length > 0) {
      steps.push(this.createStep({
        day: currentDay,
        channel: currentChannel,
        label: currentLabel,
        offset_minutes: currentOffset,
        raw_time: currentRawTime,
        body: currentBody.join('\n').trim()
      }));
    }

    return steps;
  }

  /**
   * Parse time offset string to minutes
   */
  parseTimeOffset(timeStr) {
    if (!timeStr || timeStr.toLowerCase() === 'instant') {
      return 0;
    }

    const hoursMatch = timeStr.match(/(\d+)\s*hours?/i);
    const minsMatch = timeStr.match(/(\d+)\s*mins?/i);

    let minutes = 0;
    if (hoursMatch) {
      minutes += parseInt(hoursMatch[1]) * 60;
    }
    if (minsMatch) {
      minutes += parseInt(minsMatch[1]);
    }

    return minutes;
  }

  /**
   * Create a campaign step object
   */
  createStep(data) {
    return new CampaignStep(data);
  }

  /**
   * Generate campaign ID from name
   */
  generateCampaignId(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  }
}
