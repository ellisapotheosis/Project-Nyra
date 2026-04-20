const express = require('express');
const https = require('https');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3100;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'gitea-mcp',
    timestamp: new Date().toISOString()
  });
});

// Simple API info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    service: 'gitea-mcp',
    version: '1.0.0',
    gitea_url: process.env.GITEA_URL || 'http://gitea:3000',
    status: 'ready'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Gitea MCP Server',
    health: '/health',
    info: '/api/info'
  });
});

app.listen(PORT, () => {
  console.log(`Gitea MCP server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});