import express from 'express';
import { CampaignController } from '../controllers/campaign.controller.js';
import { guardrailMiddleware } from '../middleware/guardrails.middleware.js';

const router = express.Router();

/**
 * Health check
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'campaign-engine',
    timestamp: new Date().toISOString()
  });
});

/**
 * Campaign routes
 */
router.post('/campaigns', CampaignController.createCampaign);
router.post('/campaigns/parse', CampaignController.parseCampaign);
router.get('/campaigns', CampaignController.listCampaigns);
router.get('/campaigns/:id', CampaignController.getCampaign);
router.put('/campaigns/:id', CampaignController.updateCampaign);
router.get('/campaigns/:id/stats', CampaignController.getCampaignStats);

/**
 * Execution routes
 */
router.post(
  '/campaigns/:id/execute',
  guardrailMiddleware,
  CampaignController.startExecution
);
router.get('/executions', CampaignController.listExecutions);
router.get('/executions/:id', CampaignController.getExecutionStatus);
router.post('/executions/:id/pause', CampaignController.pauseExecution);
router.post('/executions/:id/resume', CampaignController.resumeExecution);
router.post('/executions/:id/stop', CampaignController.stopExecution);

export default router;
