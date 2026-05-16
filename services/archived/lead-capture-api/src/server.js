const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3300;

const {
  CRM_API_URL = 'http://localhost:4001',
  CRM_API_KEY = ''
} = process.env;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(compression());

// Lead Ingestion
app.post('/api/leads', async (req, res) => {
  try {
    const rawData = req.body;

    console.log(`[Capture API] Received lead: ${rawData.email}`);

    // Forward to the Foundation CRM API
    const response = await axios.post(`${CRM_API_URL}/api/leads`, {
      ...rawData,
      source: rawData.source || 'landing_page_foundation'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-crm-api-key': CRM_API_KEY
      },
      timeout: 5000
    });

    console.log(`[Capture API] Foundation sync success: ${response.data.mortgageLeadId}`);

    res.status(201).json({
      success: true,
      leadId: response.data.mortgageLeadId,
      status: 'new'
    });

  } catch (error) {
    console.error('[Capture API] Error:', error.message);
    res.status(500).json({ error: 'Internal server error during lead ingestion' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'HEALTHY', service: 'lead-capture-api-foundation-aware' });
});

app.listen(PORT, () => {
  console.log(`🚀 Nyra Lead Capture (Foundation-Aware) listening on port ${PORT}`);
});
