#!/usr/bin/env node
/**
 * Cloudflare Load Balancer Management for Nyra Distributed GPU Compute
 * Manages load balancing and failover for worker nodes
 */

const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");

class CloudflareLoadBalancer {
  constructor() {
    this.apiKey = process.env.CLOUDFLARE_API_KEY;
    this.email = process.env.CLOUDFLARE_EMAIL;
    this.zoneId = process.env.CLOUDFLARE_ZONE_ID;
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    this.baseURL = "https://api.cloudflare.com/client/v4";
    this.headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Get worker configurations for load balancing
   */
  getWorkerConfigs() {
    return [
      {
        address: "worker1.projectnyra.com",
        weight: 0.7, // Lower weight for RTX 3060
        enabled: true,
        gpu: {
          model: "RTX 3060",
          vram: "12GB",
          performance_score: 70,
        },
      },
      {
        name: "worker2-rtx5090",
        address: "worker2.projectnyra.com",
        weight: 1.0, // Maximum weight for RTX 5090
        enabled: true,
        gpu: {
          model: "RTX 5090",
          vram: "32GB",
          performance_score: 100,
        },
      },
      {
        name: "worker3-rtx3090ti",
        address: "worker3.projectnyra.com",
        weight: 0.9, // High weight for RTX 3090Ti
        enabled: true,
        gpu: {
          model: "RTX 3090Ti",
          vram: "24GB",
          performance_score: 90,
        },
      },
    ];
  }

  /**
   * Create origin pool for GPU workers
   */
  async createOriginPool() {
    const workers = this.getWorkerConfigs();

    const poolConfig = {
      name: "nyra-gpu-workers",
      description: "Nyra Distributed GPU Compute Workers",
      enabled: true,
      minimum_origins: 1,
      notification_email:
        process.env.CLOUDFLARE_EMAIL || "admin@ratehunter.com",
      origins: workers.map((worker) => ({
        name: worker.name,
        address: worker.address,
        enabled: worker.enabled,
        weight: worker.weight,
        header: {
          Host: [worker.address],
        },
      })),
      monitor: {
        description: "GPU Worker Health Monitor",
        type: "https",
        method: "GET",
        path: "/health",
        header: {
          "User-Agent": ["Cloudflare-Health-Check/1.0"],
        },
        timeout: 10,
        retries: 3,
        interval: 60,
        expected_codes: "200",
        follow_redirects: false,
      },
      check_regions: ["ENAM", "WNAM", "EEUR", "WEU"],
      notification_filter: {
        pool: {
          disable: false,
          healthy: true,
        },
        origin: {
          disable: false,
          healthy: true,
        },
      },
    };

    try {
      const response = await axios.post(
        `${this.baseURL}/accounts/${this.accountId}/load_balancers/pools`,
        poolConfig,
        { headers: this.headers }
      );

      console.log("✅ Origin pool created successfully");
      console.log(`   Pool ID: ${response.data.result.id}`);
      console.log(`   Pool Name: ${response.data.result.name}`);

      // Save pool ID for future reference
      await this.savePoolConfig(response.data.result);

      return response.data.result;
    } catch (error) {
      console.error(
        "❌ Failed to create origin pool:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Create load balancer for API gateway
   */
  async createLoadBalancer(poolId) {
    const lbConfig = {
      name: "api.projectnyra.com",
      fallback_pool: poolId,
      default_pools: [poolId],
      description: "Nyra GPU Compute API Load Balancer",
      ttl: 30,
      steering_policy: "dynamic_latency",
      proxied: false, // Direct connection through tunnel
      enabled: true,
      session_affinity: "none",
      session_affinity_ttl: 5,
      adaptive_routing: {
        failover_across_pools: true,
      },
      location_strategy: {
        mode: "pop",
        prefer_ecs: "proximity",
      },
      random_steering: {
        default_weight: 1,
        pool_weights: {},
      },
    };

    try {
      const response = await axios.post(
        `${this.baseURL}/zones/${this.zoneId}/load_balancers`,
        lbConfig,
        { headers: this.headers }
      );

      console.log("✅ Load balancer created successfully");
      console.log(`   Load Balancer ID: ${response.data.result.id}`);
      console.log(`   Hostname: ${response.data.result.name}`);

      // Save load balancer config
      await this.saveLoadBalancerConfig(response.data.result);

      return response.data.result;
    } catch (error) {
      console.error(
        "❌ Failed to create load balancer:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Create geographic steering pool for regional optimization
   */
  async createGeographicSteering() {
    // Create regional pools for better performance
    const regionalPools = [
      {
        name: "nyra-gpu-primary",
        region: "WNAM",
        origins: this.getWorkerConfigs(),
      },
      // Could add more regions in the future
    ];

    const createdPools = [];

    for (const regionalPool of regionalPools) {
      const poolConfig = {
        name: regionalPool.name,
        description: `Nyra GPU Workers - ${regionalPool.region}`,
        enabled: true,
        minimum_origins: 1,
        origins: regionalPool.origins.map((worker) => ({
          name: worker.name,
          address: worker.address,
          enabled: worker.enabled,
          weight: worker.weight,
        })),
        check_regions: [regionalPool.region],
      };

      try {
        const response = await axios.post(
          `${this.baseURL}/accounts/${this.accountId}/load_balancers/pools`,
          poolConfig,
          { headers: this.headers }
        );

        createdPools.push(response.data.result);
        console.log(
          `✅ Regional pool created: ${regionalPool.name} (${regionalPool.region})`
        );
      } catch (error) {
        console.error(
          `❌ Failed to create regional pool ${regionalPool.name}:`,
          error.response?.data || error.message
        );
      }
    }

    return createdPools;
  }

  /**
   * Get existing load balancers
   */
  async getLoadBalancers() {
    try {
      const response = await axios.get(
        `${this.baseURL}/zones/${this.zoneId}/load_balancers`,
        { headers: this.headers }
      );

      return response.data.result;
    } catch (error) {
      console.error(
        "Failed to get load balancers:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Get existing origin pools
   */
  async getOriginPools() {
    try {
      const response = await axios.get(
        `${this.baseURL}/accounts/${this.accountId}/load_balancers/pools`,
        { headers: this.headers }
      );

      return response.data.result;
    } catch (error) {
      console.error(
        "Failed to get origin pools:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Update pool with current worker health
   */
  async updatePoolHealth(poolId, healthData) {
    // Get current pool configuration
    const pools = await this.getOriginPools();
    const pool = pools.find((p) => p.id === poolId);

    if (!pool) {
      throw new Error(`Pool ${poolId} not found`);
    }

    // Update origin weights based on health and performance
    const updatedOrigins = pool.origins.map((origin) => {
      const workerHealth = healthData[origin.name];
      if (workerHealth) {
        // Adjust weight based on health score and GPU utilization
        const healthFactor = workerHealth.healthScore / 100;
        const utilizationFactor = Math.max(
          0.1,
          1 - workerHealth.gpuUtilization / 100
        );
        origin.weight = origin.weight * healthFactor * utilizationFactor;
        origin.enabled = workerHealth.healthScore > 50;
      }
      return origin;
    });

    try {
      const response = await axios.put(
        `${this.baseURL}/accounts/${this.accountId}/load_balancers/pools/${poolId}`,
        { ...pool, origins: updatedOrigins },
        { headers: this.headers }
      );

      console.log("✅ Pool health updated successfully");
      return response.data.result;
    } catch (error) {
      console.error(
        "❌ Failed to update pool health:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Get load balancer analytics
   */
  async getAnalytics(since = "7d") {
    try {
      const response = await axios.get(
        `${this.baseURL}/zones/${this.zoneId}/load_balancers/analytics/events`,
        {
          headers: this.headers,
          params: { since },
        }
      );

      return response.data.result;
    } catch (error) {
      console.error(
        "Failed to get analytics:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Setup complete load balancing infrastructure
   */
  async setupComplete() {
    console.log("🚀 Setting up Cloudflare Load Balancing for Nyra...");

    try {
      // Step 1: Create origin pool
      const pool = await this.createOriginPool();

      // Step 2: Create load balancer
      const loadBalancer = await this.createLoadBalancer(pool.id);

      // Step 3: Setup geographic steering (optional)
      // const regionalPools = await this.createGeographicSteering();

      console.log("\n🎯 Load Balancing Setup Complete!");
      console.log("─".repeat(50));
      console.log(`Pool ID: ${pool.id}`);
      console.log(`Load Balancer ID: ${loadBalancer.id}`);
      console.log(`API Endpoint: https://api.projectnyra.com`);
      console.log("\n📊 Features Enabled:");
      console.log("   - Dynamic latency steering");
      console.log("   - Health monitoring");
      console.log("   - Automatic failover");
      console.log("   - Geographic optimization");

      return {
        pool,
        loadBalancer,
        apiEndpoint: "https://api.projectnyra.com",
      };
    } catch (error) {
      console.error("❌ Load balancing setup failed:", error.message);
      throw error;
    }
  }

  /**
   * Save pool configuration to file
   */
  async savePoolConfig(poolData) {
    const configPath = path.join(
      __dirname,
      "../../../config/load-balancer-pool.json"
    );
    await fs.writeFile(configPath, JSON.stringify(poolData, null, 2));
    console.log(`📁 Pool configuration saved to: ${configPath}`);
  }

  /**
   * Save load balancer configuration to file
   */
  async saveLoadBalancerConfig(lbData) {
    const configPath = path.join(
      __dirname,
      "../../../config/load-balancer.json"
    );
    await fs.writeFile(configPath, JSON.stringify(lbData, null, 2));
    console.log(`📁 Load balancer configuration saved to: ${configPath}`);
  }

  /**
   * Test load balancer functionality
   */
  async testLoadBalancer() {
    console.log("🧪 Testing load balancer functionality...");

    const testEndpoints = [
      "https://api.projectnyra.com/health",
      "https://worker1.projectnyra.com/health",
      "https://worker2.projectnyra.com/health",
      "https://worker3.projectnyra.com/health",
    ];

    const results = [];

    for (const endpoint of testEndpoints) {
      try {
        const startTime = Date.now();
        const response = await axios.get(endpoint, { timeout: 10000 });
        const responseTime = Date.now() - startTime;

        results.push({
          endpoint,
          status: "healthy",
          statusCode: response.status,
          responseTime,
        });

        console.log(`✅ ${endpoint} - ${response.status} (${responseTime}ms)`);
      } catch (error) {
        results.push({
          endpoint,
          status: "error",
          error: error.message,
        });

        console.log(`❌ ${endpoint} - ${error.message}`);
      }
    }

    return results;
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const lb = new CloudflareLoadBalancer();

  (async () => {
    try {
      switch (command) {
        case "setup":
          await lb.setupComplete();
          break;

        case "test":
          await lb.testLoadBalancer();
          break;

        case "analytics":
          const analytics = await lb.getAnalytics();
          console.log(JSON.stringify(analytics, null, 2));
          break;

        case "pools":
          const pools = await lb.getOriginPools();
          console.log("Origin Pools:");
          pools.forEach((pool) => {
            console.log(
              `  ${pool.name} (${pool.id}) - ${pool.enabled ? "Enabled" : "Disabled"}`
            );
          });
          break;

        case "balancers":
          const balancers = await lb.getLoadBalancers();
          console.log("Load Balancers:");
          balancers.forEach((balancer) => {
            console.log(
              `  ${balancer.name} (${balancer.id}) - ${balancer.enabled ? "Enabled" : "Disabled"}`
            );
          });
          break;

        default:
          console.log(`
Usage: node load-balancer.js <command>

Commands:
  setup       - Setup complete load balancing infrastructure
  test        - Test load balancer functionality
  analytics   - Get load balancer analytics
  pools       - List origin pools
  balancers   - List load balancers
          `);
      }
    } catch (error) {
      console.error("Command failed:", error.message);
      process.exit(1);
    }
  })();
}

module.exports = CloudflareLoadBalancer;
