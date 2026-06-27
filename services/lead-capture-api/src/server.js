const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const dotenv = require('dotenv');
const axios = require('axios');
const logger = require('./config/logger');
const { healthCheck } = require('./config/database');
const scoringService = require('./services/scoringService');
const duplicateDetectionService = require('./services/duplicateDetectionService');
const Lead = require('./models/Lead');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3300;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(compression());

// Health check
app.get('/health', async (req, res) => {
  const dbOk = await healthCheck();
  res.json({ 
    status: dbOk ? 'ok' : 'degraded', 
    service: 'lead-capture-api',
    database: dbOk ? 'connected' : 'disconnected'
  });
});

// Lead Ingestion
app.post('/api/leads', async (req, res) => {
  try {
    const leadData = req.body;
    
    logger.info('Received lead submission', { email: leadData.email });

    // 1. Basic Validation
    if (!leadData.firstName || !leadData.lastName || !leadData.email || !leadData.phone) {
      return res.status(400).json({ error: 'Missing required fields: firstName, lastName, email, phone' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leadData.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate phone format (E.164 or common US formats)
    const phoneRegex = /^\+?1?\d{10,15}$/;
    const sanitizedPhone = leadData.phone.replace(/[\s\-()]/g, '');
    if (!phoneRegex.test(sanitizedPhone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    if (leadData.consent === false) {
      return res.status(400).json({ error: 'TCPA consent is required' });
    }

    // 2. Initial Persistence (so we have an ID for services)
    const lead = await Lead.create({
      ...leadData,
      source: leadData.source || 'landing_page',
      tcpaConsent: true
    });

    // 3. Duplicate Detection
    let isDuplicate = false;
    try {
      const duplicates = await duplicateDetectionService.detectDuplicates(lead);
      isDuplicate = duplicates.length > 0;
    } catch (dupErr) {
      logger.error('Duplicate detection error', { error: dupErr.message });
    }

    // 4. Scoring
    let score = 0;
    try {
      const scoringResult = await scoringService.calculateScore(lead);
      score = scoringResult.score;
    } catch (scoreErr) {
      logger.error('Scoring error', { error: scoreErr.message });
    }

    // 5. Update Lead with Score and Status
    await Lead.update(lead.id, {
      score,
      status: isDuplicate ? 'duplicate' : 'new'
    });

    // 6. Forward to CRM API
    const crmApiUrl = process.env.CRM_API_URL || 'http://localhost:4001';
    const crmApiKey = process.env.CRM_API_KEY || '';

    try {
      const crmResponse = await axios.post(`${crmApiUrl}/api/leads`, {
        ...leadData,
        externalId: lead.id,
        leadScore: score,
        isDuplicate
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-crm-api-key': crmApiKey
        },
        timeout: 5000
      });

      const crmData = crmResponse.data;
      logger.info('Lead successfully synced to CRM', { crm_id: crmData.mortgageLeadId });
      
      // Update local record with CRM ID
      await Lead.update(lead.id, {
        twenty_crm_id: crmData.mortgageLeadId
      });
    } catch (crmErr) {
      logger.error('Error forwarding lead to CRM', { 
        error: crmErr.message, 
        response: crmErr.response?.data 
      });
    }

    res.status(201).json({
      success: true,
      leadId: lead.id,
      score,
      status: isDuplicate ? 'duplicate' : 'new'
    });

  } catch (error) {
    logger.error('Lead ingestion error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Internal server error during lead ingestion' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`Lead Capture API listening on port ${PORT}`);
});
