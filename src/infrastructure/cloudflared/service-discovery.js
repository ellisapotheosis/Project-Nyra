#!/usr/bin/env node
/**
 * Service Discovery System for Nyra Distributed GPU Compute
 * Handles registration, health monitoring, and load balancing
 */

const EventEmitter = require('events');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class ServiceDiscovery extends EventEmitter {
  constructor() {
    super();
    this.services = new Map();
    this.healthCheckInterval = 30000; // 30 seconds
    this.healthCheckTimeout = 10000; // 10 seconds
    this.isRunning = false;
    this.registryPath = path.join(__dirname, '../../../data/service-registry.json');
  }

  /**
   * Node configuration for all compute nodes
   */
  getNodeConfigurations() {
    return {
      orchestrator: {
        name: 'orchestrator',
        hostname: 'orchestrator.ratehunter.net',
        internalIP: '192.168.1.100',
        role: 'coordinator',
        capabilities: ['coordination', 'task-distribution', 'health-monitoring'],
        services: {
          'archon-os': { port: 3000, path: '/health' },
          'task-api': { port: 8080, path: '/health' },
          'health-dashboard': { port: 9090, path: '/health' },
          'gpu-metrics': { port: 8081, path: '/metrics' }
        },
        gpu: null,
        priority: 100
      },
      worker1: {
        name: 'worker1',
        hostname: 'worker1.ratehunter.net',
        internalIP: '192.168.1.101',
        role: 'compute-worker',
        capabilities: ['gpu-compute', 'ai-inference'],
        services: {
          'gpu-api': { port: 8082, path: '/health' },
          'health': { port: 8083, path: '/health' }
        },
        gpu: {
          model: 'RTX 3060',
          vram: '12GB',
          compute: '6.1',
          performance_tier: 'mid'
        },
        priority: 70
      },
      worker2: {
        name: 'worker2',
        hostname: 'worker2.ratehunter.net',
        internalIP: '192.168.1.102',
        role: 'compute-worker',
        capabilities: ['gpu-compute', 'ai-inference', 'high-performance'],
        services: {
          'gpu-api': { port: 8084, path: '/health' },
          'health': { port: 8085, path: '/health' }
        },
        gpu: {
          model: 'RTX 5090',
          vram: '32GB',
          compute: '8.9',
          performance_tier: 'high'
        },
        priority: 100
      },
      worker3: {
        name: 'worker3',
        hostname: 'worker3.ratehunter.net',
        internalIP: '192.168.1.103',
        role: 'compute-worker',
        capabilities: ['gpu-compute', 'ai-inference', 'high-performance'],
        services: {
          'gpu-api': { port: 8086, path: '/health' },
          'health': { port: 8087, path: '/health' }
        },
        gpu: {
          model: 'RTX 3090Ti',
          vram: '24GB',
          compute: '8.6',
          performance_tier: 'high'
        },
        priority: 90
      }
    };
  }

  /**
   * Register a service with the discovery system
   */
  async registerService(nodeConfig) {
    const serviceId = `${nodeConfig.name}-${Date.now()}`;

    const serviceEntry = {
      id: serviceId,
      ...nodeConfig,
      status: 'initializing',
      lastSeen: new Date(),
      healthScore: 0,
      uptime: 0,
      registeredAt: new Date()
    };

    this.services.set(serviceId, serviceEntry);

    // Start health checks for this service
    this.startHealthChecks(serviceId);

    // Emit registration event
    this.emit('serviceRegistered', serviceEntry);

    console.log(`✅ Registered service: ${nodeConfig.name} (${serviceId})`);

    await this.persistRegistry();
    return serviceId;
  }

  /**
   * Unregister a service
   */
  async unregisterService(serviceId) {
    const service = this.services.get(serviceId);
    if (service) {
      this.services.delete(serviceId);
      this.emit('serviceUnregistered', service);
      console.log(`❌ Unregistered service: ${service.name} (${serviceId})`);
      await this.persistRegistry();
    }
  }

  /**
   * Start health monitoring for all services
   */
  async startHealthMonitoring() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('🔍 Starting service discovery health monitoring...');

    // Load existing registry
    await this.loadRegistry();

    // Start health check loop
    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthChecks();
    }, this.healthCheckInterval);

    // Start service auto-discovery
    this.discoveryTimer = setInterval(async () => {
      await this.autoDiscoverServices();
    }, 60000); // Every minute
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring() {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.healthCheckTimer) clearInterval(this.healthCheckTimer);
    if (this.discoveryTimer) clearInterval(this.discoveryTimer);

    console.log('⏹️ Stopped service discovery health monitoring');
  }

  /**
   * Perform health checks on all registered services
   */
  async performHealthChecks() {
    const promises = Array.from(this.services.keys()).map(serviceId =>
      this.checkServiceHealth(serviceId)
    );

    await Promise.allSettled(promises);
  }

  /**
   * Check health of a specific service
   */
  async checkServiceHealth(serviceId) {
    const service = this.services.get(serviceId);
    if (!service) return;

    let healthScore = 0;
    const healthChecks = [];

    try {
      // Check each service endpoint
      for (const [serviceName, serviceConfig] of Object.entries(service.services)) {
        try {
          const url = `http://${service.internalIP}:${serviceConfig.port}${serviceConfig.path}`;
          const startTime = Date.now();

          const response = await axios.get(url, {
            timeout: this.healthCheckTimeout,
            validateStatus: (status) => status < 500 // Allow 4xx as "healthy"
          });

          const responseTime = Date.now() - startTime;

          healthChecks.push({
            service: serviceName,
            status: 'healthy',
            responseTime,
            statusCode: response.status
          });

          healthScore += 1;
        } catch (error) {
          healthChecks.push({
            service: serviceName,
            status: 'unhealthy',
            error: error.message
          });
        }
      }

      // Calculate health score (percentage)
      const maxScore = Object.keys(service.services).length;
      service.healthScore = Math.round((healthScore / maxScore) * 100);
      service.lastSeen = new Date();
      service.status = service.healthScore > 50 ? 'healthy' : 'unhealthy';
      service.healthChecks = healthChecks;

      // Update uptime
      service.uptime = Date.now() - service.registeredAt.getTime();

      this.emit('healthCheckCompleted', service);

    } catch (error) {
      service.status = 'error';
      service.healthScore = 0;
      service.error = error.message;

      this.emit('healthCheckFailed', service);
    }

    this.services.set(serviceId, service);
  }

  /**
   * Auto-discover services on the network
   */
  async autoDiscoverServices() {
    const nodeConfigs = this.getNodeConfigurations();

    for (const [nodeName, config] of Object.entries(nodeConfigs)) {
      // Check if service is already registered
      const existingService = Array.from(this.services.values()).find(
        service => service.name === nodeName
      );

      if (!existingService) {
        // Try to discover the service
        try {
          const isReachable = await this.pingNode(config.internalIP);
          if (isReachable) {
            console.log(`🔎 Auto-discovered service: ${nodeName}`);
            await this.registerService(config);
          }
        } catch (error) {
          // Service not available for auto-discovery
        }
      }
    }
  }

  /**
   * Ping a node to check if it's reachable
   */
  async pingNode(ip) {
    try {
      const { stdout } = await execAsync(`ping -c 1 -W 2 ${ip}`);
      return stdout.includes('1 received');
    } catch (error) {
      return false;
    }
  }

  /**
   * Get healthy services for load balancing
   */
  getHealthyServices(role = null, capabilities = []) {
    const healthyServices = Array.from(this.services.values())
      .filter(service => service.status === 'healthy' && service.healthScore > 70)
      .filter(service => !role || service.role === role)
      .filter(service =>
        capabilities.length === 0 ||
        capabilities.every(cap => service.capabilities.includes(cap))
      )
      .sort((a, b) => b.priority - a.priority); // Sort by priority (descending)

    return healthyServices;
  }

  /**
   * Select best service for workload
   */
  selectBestService(requirements = {}) {
    const {
      role = 'compute-worker',
      gpuRequired = true,
      performanceTier = 'any',
      capabilities = []
    } = requirements;

    let candidates = this.getHealthyServices(role, capabilities);

    if (gpuRequired) {
      candidates = candidates.filter(service => service.gpu);
    }

    if (performanceTier !== 'any') {
      candidates = candidates.filter(service =>
        service.gpu && service.gpu.performance_tier === performanceTier
      );
    }

    if (candidates.length === 0) return null;

    // Select based on current load (simplified: use health score as proxy)
    return candidates.sort((a, b) => b.healthScore - a.healthScore)[0];
  }

  /**
   * Wake up a worker node using Wake-on-LAN
   */
  async wakeWorker(nodeName) {
    // This would implement Wake-on-LAN magic packet sending
    // For now, return a promise that resolves after simulated wake time
    console.log(`⏰ Sending Wake-on-LAN packet to ${nodeName}...`);

    // Simulate wake-up time
    await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds

    // Try to auto-discover the awakened service
    await this.autoDiscoverServices();

    return true;
  }

  /**
   * Get service registry status
   */
  getRegistryStatus() {
    const services = Array.from(this.services.values());

    return {
      totalServices: services.length,
      healthyServices: services.filter(s => s.status === 'healthy').length,
      unhealthyServices: services.filter(s => s.status === 'unhealthy').length,
      errorServices: services.filter(s => s.status === 'error').length,
      servicesByRole: services.reduce((acc, service) => {
        acc[service.role] = (acc[service.role] || 0) + 1;
        return acc;
      }, {}),
      averageHealthScore: services.length > 0
        ? Math.round(services.reduce((sum, s) => sum + s.healthScore, 0) / services.length)
        : 0,
      lastUpdate: new Date()
    };
  }

  /**
   * Persist service registry to disk
   */
  async persistRegistry() {
    try {
      const registryData = {
        services: Array.from(this.services.entries()),
        lastUpdate: new Date(),
        version: '1.0.0'
      };

      await fs.writeFile(this.registryPath, JSON.stringify(registryData, null, 2));
    } catch (error) {
      console.error('Failed to persist service registry:', error.message);
    }
  }

  /**
   * Load service registry from disk
   */
  async loadRegistry() {
    try {
      const data = await fs.readFile(this.registryPath, 'utf-8');
      const registryData = JSON.parse(data);

      // Restore services from saved data
      registryData.services.forEach(([id, service]) => {
        // Convert date strings back to Date objects
        service.lastSeen = new Date(service.lastSeen);
        service.registeredAt = new Date(service.registeredAt);
        this.services.set(id, service);
      });

      console.log(`📁 Loaded ${registryData.services.length} services from registry`);
    } catch (error) {
      console.log('📝 No existing service registry found, starting fresh');
    }
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const discovery = new ServiceDiscovery();

  (async () => {
    try {
      switch (command) {
        case 'start':
          await discovery.startHealthMonitoring();
          console.log('Service discovery is running. Press Ctrl+C to stop.');

          // Handle graceful shutdown
          process.on('SIGINT', () => {
            discovery.stopHealthMonitoring();
            process.exit(0);
          });

          // Keep process alive
          setInterval(() => {}, 1000);
          break;

        case 'status':
          await discovery.loadRegistry();
          const status = discovery.getRegistryStatus();
          console.log(JSON.stringify(status, null, 2));
          break;

        case 'discover':
          await discovery.autoDiscoverServices();
          console.log('Auto-discovery completed');
          break;

        case 'register':
          const nodeName = process.argv[3];
          if (!nodeName) {
            console.error('Please specify node name: orchestrator, worker1, worker2, worker3');
            process.exit(1);
          }

          const nodeConfigs = discovery.getNodeConfigurations();
          const config = nodeConfigs[nodeName];
          if (!config) {
            console.error(`Unknown node: ${nodeName}`);
            process.exit(1);
          }

          const serviceId = await discovery.registerService(config);
          console.log(`Registered ${nodeName} with ID: ${serviceId}`);
          break;

        default:
          console.log(`
Usage: node service-discovery.js <command>

Commands:
  start              - Start service discovery and health monitoring
  status             - Show current registry status
  discover           - Run auto-discovery for services
  register <node>    - Manually register a node (orchestrator, worker1, worker2, worker3)
          `);
      }
    } catch (error) {
      console.error('Command failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = ServiceDiscovery;