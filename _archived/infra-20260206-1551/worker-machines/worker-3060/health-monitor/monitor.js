const express = require('express');
const promClient = require('prom-client');
const axios = require('axios');
const Docker = require('dockerode');
require('dotenv').config();

const app = express();
const PORT = process.env.HEALTH_MONITOR_PORT || 9090;
const CHECK_INTERVAL = parseInt(process.env.HEALTH_CHECK_INTERVAL || '60') * 1000;

// Docker client
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const serviceHealthGauge = new promClient.Gauge({
  name: 'worker_service_health',
  help: 'Service health status (1 = healthy, 0 = unhealthy)',
  labelNames: ['service'],
  registers: [register]
});

const serviceLatencyGauge = new promClient.Gauge({
  name: 'worker_service_latency_ms',
  help: 'Service response latency in milliseconds',
  labelNames: ['service'],
  registers: [register]
});

const containerStatusGauge = new promClient.Gauge({
  name: 'worker_container_status',
  help: 'Container status (1 = running, 0 = stopped)',
  labelNames: ['container'],
  registers: [register]
});

const ollamaRequestCounter = new promClient.Counter({
  name: 'worker_ollama_requests_total',
  help: 'Total Ollama requests',
  labelNames: ['model', 'status'],
  registers: [register]
});

// Service configuration
const SERVICES = {
  ollama: {
    url: process.env.OLLAMA_URL || 'http://ollama:11434',
    healthPath: '/api/version',
    timeout: 5000
  },
  onnx: {
    url: process.env.ONNX_URL || 'http://onnx-runtime:8001',
    healthPath: '/v2/health/ready',
    timeout: 3000
  },
  embedding: {
    url: process.env.EMBEDDING_URL || 'http://embedding-service:8080',
    healthPath: '/health',
    timeout: 3000
  }
};

// Service health state
const serviceHealth = {
  ollama: { status: 'unknown', lastCheck: null, latency: 0 },
  onnx: { status: 'unknown', lastCheck: null, latency: 0 },
  embedding: { status: 'unknown', lastCheck: null, latency: 0 }
};

// Container state
const containerHealth = {};

// ============================================================================
// Health Check Functions
// ============================================================================

async function checkService(name, config) {
  const startTime = Date.now();
  try {
    const response = await axios.get(config.url + config.healthPath, {
      timeout: config.timeout,
      validateStatus: (status) => status >= 200 && status < 500
    });

    const latency = Date.now() - startTime;
    const healthy = response.status >= 200 && response.status < 300;

    serviceHealth[name] = {
      status: healthy ? 'healthy' : 'unhealthy',
      lastCheck: new Date().toISOString(),
      latency: latency,
      statusCode: response.status
    };

    serviceHealthGauge.set({ service: name }, healthy ? 1 : 0);
    serviceLatencyGauge.set({ service: name }, latency);

    return healthy;
  } catch (error) {
    serviceHealth[name] = {
      status: 'unhealthy',
      lastCheck: new Date().toISOString(),
      latency: Date.now() - startTime,
      error: error.message
    };

    serviceHealthGauge.set({ service: name }, 0);
    return false;
  }
}

async function checkAllServices() {
  const checks = Object.entries(SERVICES).map(([name, config]) =>
    checkService(name, config)
  );
  await Promise.all(checks);
}

async function checkContainers() {
  try {
    const containers = await docker.listContainers({ all: true });

    for (const container of containers) {
      const name = container.Names[0].replace('/', '');
      if (name.startsWith('worker-3060')) {
        const running = container.State === 'running';
        containerHealth[name] = {
          status: container.State,
          image: container.Image,
          created: new Date(container.Created * 1000).toISOString()
        };

        containerStatusGauge.set({ container: name }, running ? 1 : 0);
      }
    }
  } catch (error) {
    console.error('Error checking containers:', error.message);
  }
}

// ============================================================================
// Background Monitoring
// ============================================================================

setInterval(async () => {
  await checkAllServices();
  await checkContainers();
}, CHECK_INTERVAL);

// Initial check
(async () => {
  await checkAllServices();
  await checkContainers();
})();

// ============================================================================
// API Endpoints
// ============================================================================

app.use(express.json());

// Overall health
app.get('/health', (req, res) => {
  const allHealthy = Object.values(serviceHealth).every(s => s.status === 'healthy');
  const status = allHealthy ? 'healthy' : 'degraded';

  res.status(allHealthy ? 200 : 503).json({
    status: status,
    worker: process.env.WORKER_NAME || 'worker-3060',
    timestamp: new Date().toISOString(),
    services: serviceHealth,
    containers: containerHealth,
    uptime: process.uptime()
  });
});

// Service details
app.get('/services', (req, res) => {
  res.json({
    services: serviceHealth,
    timestamp: new Date().toISOString()
  });
});

// Container details
app.get('/containers', (req, res) => {
  res.json({
    containers: containerHealth,
    timestamp: new Date().toISOString()
  });
});

// Specific service health
app.get('/services/:name', async (req, res) => {
  const { name } = req.params;

  if (!SERVICES[name]) {
    return res.status(404).json({ error: 'Service not found' });
  }

  await checkService(name, SERVICES[name]);

  res.json({
    service: name,
    health: serviceHealth[name]
  });
});

// Ollama models
app.get('/ollama/models', async (req, res) => {
  try {
    const response = await axios.get(SERVICES.ollama.url + '/api/tags', {
      timeout: 5000
    });

    res.json({
      models: response.data.models || [],
      count: response.data.models?.length || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GPU info (from nvidia-smi via node-exporter or direct call)
app.get('/gpu', async (req, res) => {
  try {
    // This would typically call nvidia-smi or read from GPU exporter
    // For now, return placeholder
    res.json({
      model: process.env.GPU_MODEL || 'RTX_3060',
      vram_gb: parseInt(process.env.VRAM_GB || '12'),
      status: 'available',
      message: 'GPU metrics available via Prometheus GPU exporter on port 9445'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// System info
app.get('/system', (req, res) => {
  res.json({
    worker: process.env.WORKER_NAME || 'worker-3060',
    type: process.env.WORKER_TYPE || 'gpu',
    role: process.env.WORKER_ROLE || 'document-processing',
    gpu_model: process.env.GPU_MODEL || 'RTX_3060',
    vram_gb: parseInt(process.env.VRAM_GB || '12'),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    platform: process.platform,
    arch: process.arch,
    node_version: process.version
  });
});

// Prometheus metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Ready check (for Kubernetes)
app.get('/ready', (req, res) => {
  const allReady = Object.values(serviceHealth).every(s => s.status === 'healthy');
  res.status(allReady ? 200 : 503).json({
    ready: allReady,
    timestamp: new Date().toISOString()
  });
});

// Liveness check (for Kubernetes)
app.get('/live', (req, res) => {
  res.json({
    alive: true,
    timestamp: new Date().toISOString()
  });
});

// Force health check
app.post('/check', async (req, res) => {
  await checkAllServices();
  await checkContainers();

  res.json({
    message: 'Health check triggered',
    services: serviceHealth,
    containers: containerHealth
  });
});

// ============================================================================
// Server Startup
// ============================================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Worker-3060 Health Monitor running on port ${PORT}`);
  console.log(`Check interval: ${CHECK_INTERVAL / 1000}s`);
  console.log(`Monitoring services: ${Object.keys(SERVICES).join(', ')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});
