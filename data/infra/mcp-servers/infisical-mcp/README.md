# Infisical MCP Server

This MCP server acts as a bridge between your agents and the Infisical secrets manager.

## Implementation

This is currently a placeholder directory. You'll need to implement:

1. A basic Express or Fastify server
2. Authentication with the Infisical API
3. Endpoints for:
   - Retrieving secrets
   - Creating secrets
   - Listing secrets
   - Updating secrets

## Folder Structure (Recommended)

```
infisical-mcp/
├── package.json
├── src/
│   ├── index.js
│   ├── routes/
│   ├── controllers/
│   └── services/
└── README.md
```

## Sample Implementation

Here's a starting point for `package.json`:

```json
{
  "name": "infisical-mcp",
  "version": "0.1.0",
  "description": "MCP server for Infisical secrets management",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "infisical-node": "^2.0.1",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.0.1"
  }
}
```

And a simple `src/index.js`:

```js
const express = require('express');
const cors = require('cors');
const { Infisical } = require('infisical-node');

const app = express();
const port = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());

// Initialize Infisical with token
const infisical = new Infisical({
  token: process.env.INFISICAL_TOKEN,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Get a secret
app.get('/api/secrets/:key', async (req, res) => {
  try {
    const secret = await infisical.getSecret(req.params.key);
    res.json({ key: req.params.key, value: secret.secretValue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add more endpoints here

app.listen(port, () => {
  console.log(`Infisical MCP server listening on port ${port}`);
});
```