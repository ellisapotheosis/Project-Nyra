#!/usr/bin/env node

/**
 * Enhanced MetaMCP Gateway with Infisical Integration
 * Provides unified MCP server access with automatic secret injection
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const WebSocket = require('ws');
const winston = require('winston');
const helmet = require('helmet');
const cors = require('cors');
const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs').promises;

// Configuration
const config = {
  port: process.env.GATEWAY_PORT || 8005,
  pcId: process.env.NYRA_PC_ID || 'orchestrator',
  logLevel: process.env.LOG_LEVEL || 'info',
  autoSecretInjection: process.env.AUTO_SECRET_INJECTION === 'true',

  // MCP Server endpoints
  mcpServers: {
    'claude-flow': {
      url: process.env.CLAUDE_FLOW_ENDPOINT || 'http://claude-flow-mcp:8003',
      enabled: true,
      description: 'Claude Flow MCP Server for SPARC workflows'
    },
    'archon': {
      url: process.env.ARCHON_MCP_ENDPOINT || 'http://archon-mcp:8004',
      enabled: true,
      description: 'Archon MCP Server for AI orchestration'
    },
    'infisical': {
      url: process.env.INFISICAL_MCP_ENDPOINT || 'http://infisical-mcp:8006',
      enabled: true,
      description: 'Infisical MCP Server for secret management'
    }
  },

  // Infisical configuration
  infisical: {
    projectId: process.env.INFISICAL_PROJECT_ID,
    token: process.env.INFISICAL_TOKEN,
    environment: process.env.NYRA_ENVIRONMENT || 'development',
    path: `/nyra/${process.env.NYRA_PC_ID || 'orchestrator'}`
  }
};

// Logger setup
const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'metamcp-gateway-enhanced',
    pc: config.pcId
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({
      filename: '/app/logs/metamcp-gateway.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
});

// Secret manager for Infisical integration
class SecretManager {
  constructor() {
    this.cache = new Map();
    this.lastUpdate = null;
    this.updateInterval = 5 * 60 * 1000; // 5 minutes
  }

  async getSecret(key, options = {}) {
    try {
      const args = ['secrets', 'get', key];

      if (options.env) args.push('--env', options.env);
      if (options.path) args.push('--path', options.path);
      args.push('--plain');

      const result = await this.executeInfisical(args);
      return result.stdout.trim();
    } catch (error) {
      logger.error(`Failed to get secret: ${key}`, { error: error.message });
      return null;
    }
  }

  async getAllSecrets(options = {}) {
    try {
      const args = ['secrets', 'get'];

      if (options.env) args.push('--env', options.env);
      if (options.path) args.push('--path', options.path);
      args.push('--output', 'json');

      const result = await this.executeInfisical(args);
      return JSON.parse(result.stdout);
    } catch (error) {
      logger.error('Failed to get all secrets', { error: error.message });
      return {};
    }
  }

  async executeInfisical(args) {
    return new Promise((resolve, reject) => {
      const child = spawn('infisical', args, {
        stdio: ['inherit', 'pipe', 'pipe'],
        env: {
          ...process.env,
          INFISICAL_DISABLE_UPDATE_CHECK: 'true'
        }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          reject(new Error(`Infisical failed with code ${code}: ${stderr}`));
        }
      });
    });
  }

  async injectSecretsIntoRequest(req) {
    if (!config.autoSecretInjection) return;

    try {
      const secrets = await this.getAllSecrets({
        env: config.infisical.environment,
        path: config.infisical.path
      });

      // Inject secrets into request headers for downstream services
      if (secrets && typeof secrets === 'object') {
        Object.entries(secrets).forEach(([key, value]) => {
          req.headers[`x-nyra-secret-${key.toLowerCase()}`] = value;
        });
      }
    } catch (error) {
      logger.warn('Failed to inject secrets into request', { error: error.message });
    }
  }
}

// MCP Server health monitor
class HealthMonitor {
  constructor() {
    this.serverHealth = new Map();
    this.checkInterval = 30000; // 30 seconds
  }

  start() {
    setInterval(() => this.checkAllServers(), this.checkInterval);
    logger.info('Health monitor started');
  }

  async checkAllServers() {
    for (const [name, server] of Object.entries(config.mcpServers)) {
      if (server.enabled) {
        const health = await this.checkServerHealth(server.url);
        this.serverHealth.set(name, {
          ...health,
          lastChecked: new Date(),
          url: server.url
        });
      }
    }
  }

  async checkServerHealth(url) {
    try {
      const healthUrl = new URL('/health', url).toString();
      const response = await axios.get(healthUrl, { timeout: 5000 });

      return {
        status: 'healthy',
        responseTime: response.duration || 0,
        statusCode: response.status,
        data: response.data
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        statusCode: error.response?.status || 0
      };
    }
  }

  getHealthSummary() {
    const summary = {};
    for (const [name, health] of this.serverHealth.entries()) {
      summary[name] = {
        status: health.status,
        lastChecked: health.lastChecked,
        url: health.url
      };
    }
    return summary;
  }
}

// Express app setup
const app = express();
const secretManager = new SecretManager();
const healthMonitor = new HealthMonitor();

app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware for secret injection
app.use(async (req, res, next) => {
  await secretManager.injectSecretsIntoRequest(req);
  next();
});

// Health endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    service: 'metamcp-gateway-enhanced',
    version: '2.0.0',
    pcId: config.pcId,
    environment: config.infisical.environment,
    timestamp: new Date().toISOString(),
    mcpServers: healthMonitor.getHealthSummary(),
    features: {
      autoSecretInjection: config.autoSecretInjection,
      infisicalIntegration: true,
      mcpProxy: true
    }
  };

  res.json(health);
});

// MCP capabilities endpoint
app.get('/mcp/capabilities', (req, res) => {
  const capabilities = {
    gateway: 'metamcp-gateway-enhanced',
    version: '2.0.0',
    features: ['proxy', 'load_balancing', 'secret_injection', 'health_monitoring'],
    servers: Object.keys(config.mcpServers).filter(name =>
      config.mcpServers[name].enabled
    ),
    endpoints: {
      health: '/health',
      proxy: '/mcp/{server}/*',
      servers: '/mcp/servers',
      secrets: '/secrets/*'
    }
  };

  res.json(capabilities);
});

// List available MCP servers
app.get('/mcp/servers', (req, res) => {
  const servers = {};

  for (const [name, server] of Object.entries(config.mcpServers)) {
    if (server.enabled) {
      const health = healthMonitor.serverHealth.get(name);
      servers[name] = {
        url: server.url,
        description: server.description,
        status: health?.status || 'unknown',
        lastChecked: health?.lastChecked || null
      };
    }
  }

  res.json(servers);
});

// Secret management endpoints
app.get('/secrets/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { env, path } = req.query;

    const secret = await secretManager.getSecret(key, { env, path });

    if (secret !== null) {
      res.json({ key, value: secret });
    } else {
      res.status(404).json({ error: 'Secret not found' });
    }
  } catch (error) {
    logger.error('Secret retrieval failed', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/secrets', async (req, res) => {
  try {
    const { env, path } = req.query;
    const secrets = await secretManager.getAllSecrets({ env, path });
    res.json(secrets);
  } catch (error) {
    logger.error('Secrets retrieval failed', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dynamic MCP server proxy
Object.entries(config.mcpServers).forEach(([name, server]) => {
  if (!server.enabled) return;

  const proxyPath = `/mcp/${name}`;

  app.use(proxyPath, createProxyMiddleware({
    target: server.url,
    changeOrigin: true,
    pathRewrite: {
      [`^${proxyPath}`]: ''
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add metadata headers
      proxyReq.setHeader('x-nyra-pc-id', config.pcId);
      proxyReq.setHeader('x-nyra-environment', config.infisical.environment);
      proxyReq.setHeader('x-gateway-version', '2.0.0');

      logger.debug('Proxying request', {
        server: name,
        method: req.method,
        path: req.path,
        target: server.url
      });
    },
    onProxyRes: (proxyRes, req, res) => {
      // Add response headers
      proxyRes.headers['x-proxied-by'] = 'metamcp-gateway-enhanced';
      proxyRes.headers['x-proxy-server'] = name;
    },
    onError: (err, req, res) => {
      logger.error('Proxy error', {
        server: name,
        error: err.message,
        path: req.path
      });

      res.status(502).json({
        error: 'Bad Gateway',
        message: `Failed to connect to ${name} server`,
        server: name
      });
    }
  }));

  logger.info(`Configured proxy for ${name}`, {
    path: proxyPath,
    target: server.url
  });
});

// WebSocket upgrade handling
const server = require('http').createServer(app);

server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathParts = url.pathname.split('/');

  if (pathParts[1] === 'mcp' && pathParts[2]) {
    const serverName = pathParts[2];
    const serverConfig = config.mcpServers[serverName];

    if (serverConfig && serverConfig.enabled) {
      // Proxy WebSocket connection to MCP server
      const wsUrl = serverConfig.url.replace('http://', 'ws://').replace('https://', 'wss://');
      const ws = new WebSocket(wsUrl);

      ws.on('open', () => {
        logger.debug('WebSocket proxy established', { server: serverName });
      });

      socket.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      });

      ws.on('message', (data) => {
        socket.write(data);
      });

      ws.on('close', () => {
        socket.end();
      });

      socket.on('close', () => {
        ws.close();
      });
    } else {
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
      socket.destroy();
    }
  } else {
    socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
    socket.destroy();
  }
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Express error', {
    error: err.message,
    stack: err.stack,
    path: req.path
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
async function start() {
  logger.info('Starting Enhanced MetaMCP Gateway', { config });

  // Start health monitor
  healthMonitor.start();

  // Initial health check
  await healthMonitor.checkAllServers();

  // Start server
  server.listen(config.port, () => {
    logger.info(`Enhanced MetaMCP Gateway listening on port ${config.port}`);
    logger.info('Available MCP servers:', Object.keys(config.mcpServers).filter(name =>
      config.mcpServers[name].enabled
    ));
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason });
  process.exit(1);
});

// Start the gateway
start().catch((error) => {
  logger.error('Failed to start gateway', { error: error.stack });
  process.exit(1);
});