import { CampaignService } from '../services/campaign.service.js';
import { DocxCampaignParser } from '../parsers/docx-parser.js';
import { logger } from '../utils/logger.js';

const campaignService = new CampaignService();
const parser = new DocxCampaignParser();

/**
 * Campaign Controller
 * Handles HTTP requests for campaign operations
 */
export class CampaignController {
  /**
   * Create a new campaign
   * POST /api/campaigns
   */
  static async createCampaign(req, res) {
    try {
      const result = await campaignService.saveCampaign(req.body);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      logger.error('Error in createCampaign', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Parse campaign from DOCX file
   * POST /api/campaigns/parse
   */
  static async parseCampaign(req, res) {
    try {
      const { filePath } = req.body;

      if (!filePath) {
        return res.status(400).json({ error: 'filePath is required' });
      }

      const campaign = await parser.parseFile(filePath);
      const result = await campaignService.saveCampaign(campaign.toJSON());

      res.status(201).json(result);
    } catch (error) {
      logger.error('Error in parseCampaign', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get campaign by ID
   * GET /api/campaigns/:id
   */
  static async getCampaign(req, res) {
    try {
      const { id } = req.params;
      const result = await campaignService.getCampaign(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error in getCampaign', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * List all campaigns
   * GET /api/campaigns
   */
  static async listCampaigns(req, res) {
    try {
      const filters = {
        status: req.query.status
      };

      const result = await campaignService.listCampaigns(filters);
      res.json(result);
    } catch (error) {
      logger.error('Error in listCampaigns', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update campaign
   * PUT /api/campaigns/:id
   */
  static async updateCampaign(req, res) {
    try {
      const { id } = req.params;
      const campaignData = { ...req.body, id };

      const result = await campaignService.saveCampaign(campaignData);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error in updateCampaign', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Start campaign execution for a contact
   * POST /api/campaigns/:id/execute
   */
  static async startExecution(req, res) {
    try {
      const { id } = req.params;
      const { contact } = req.body;

      if (!contact || !contact.id) {
        return res.status(400).json({ error: 'Valid contact object is required' });
      }

      const result = await campaignService.startCampaignExecution(id, contact);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      logger.error('Error in startExecution', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get execution status
   * GET /api/executions/:id
   */
  static async getExecutionStatus(req, res) {
    try {
      const { id } = req.params;
      const result = await campaignService.getExecutionStatus(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error in getExecutionStatus', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * List executions
   * GET /api/executions
   */
  static async listExecutions(req, res) {
    try {
      const filters = {
        campaignId: req.query.campaignId,
        contactId: req.query.contactId,
        status: req.query.status
      };

      const result = await campaignService.listExecutions(filters);
      res.json(result);
    } catch (error) {
      logger.error('Error in listExecutions', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Pause execution
   * POST /api/executions/:id/pause
   */
  static async pauseExecution(req, res) {
    try {
      const { id } = req.params;
      const result = await campaignService.pauseExecution(id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error in pauseExecution', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Resume execution
   * POST /api/executions/:id/resume
   */
  static async resumeExecution(req, res) {
    try {
      const { id } = req.params;
      const result = await campaignService.resumeExecution(id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error in resumeExecution', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Stop execution
   * POST /api/executions/:id/stop
   */
  static async stopExecution(req, res) {
    try {
      const { id } = req.params;
      const result = await campaignService.stopExecution(id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      logger.error('Error in stopExecution', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get campaign statistics
   * GET /api/campaigns/:id/stats
   */
  static async getCampaignStats(req, res) {
    try {
      const { id } = req.params;
      const result = await campaignService.getCampaignStats(id);

      res.json(result);
    } catch (error) {
      logger.error('Error in getCampaignStats', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
