#!/usr/bin/env node
/**
 * Cloudflare DNS Management System for Nyra Distributed Compute
 * Manages DNS records for all compute nodes and services
 */

const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");

class CloudflareDNSManager {
  constructor() {
    this.apiKey = process.env.CLOUDFLARE_API_KEY;
    this.email = process.env.CLOUDFLARE_EMAIL;
    this.zoneId = process.env.CLOUDFLARE_ZONE_ID; // ratehunter.net zone
    this.baseURL = "https://api.cloudflare.com/client/v4";
    this.headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * DNS record configurations for all Nyra services
   */
  getDNSRecords() {
    return [
      {
        name: "orchestrator.projectnyra.com",
        type: "CNAME",
        content: `${process.env.NYRA_ORCHESTRATOR_TUNNEL_ID}.cfargotunnel.com`,
        comment: "Nyra Orchestrator Node - Minisforum UH680",
      },
      {
        name: "worker1.projectnyra.com",
        type: "CNAME",
        content: `${process.env.NYRA_ORCHESTRATOR_TUNNEL_ID}.cfargotunnel.com`,
        comment: "Nyra Worker 1 - Alienware M15R7 (RTX 3060)",
      },
      {
        name: "worker2.projectnyra.com",
        type: "CNAME",
        content: `${process.env.NYRA_ORCHESTRATOR_TUNNEL_ID}.cfargotunnel.com`,
        comment: "Nyra Worker 2 - Alienware Area-51 (RTX 5090)",
      },
      {
        name: "worker3.projectnyra.com",
        type: "CNAME",
        content: `${process.env.NYRA_ORCHESTRATOR_TUNNEL_ID}.cfargotunnel.com`,
        comment: "Nyra Worker 3 - Desktop PC (RTX 3090Ti)",
      },
      {
        name: "api.projectnyra.com",
        type: "CNAME",
        content: `${process.env.NYRA_ORCHESTRATOR_TUNNEL_ID}.cfargotunnel.com`,
        comment: "Nyra API Gateway - Load Balanced",
      },
      {
        name: "health.projectnyra.com",
        type: "CNAME",
        content: `${process.env.NYRA_ORCHESTRATOR_TUNNEL_ID}.cfargotunnel.com`,
        comment: "Nyra Health Monitoring Dashboard",
      },
      {
        name: "app.projectnyra.com",
        type: "CNAME",
        content: `${process.env.NYRA_ORCHESTRATOR_TUNNEL_ID}.cfargotunnel.com`,
        comment: "Main Nyra Interface",
      },
    ];
  }

  /**
   * Create or update DNS record
   */
  async createOrUpdateRecord(record) {
    try {
      // Check if record exists
      const existingRecords = await this.getRecords(record.name);

      if (existingRecords.length > 0) {
        // Update existing record
        const existingRecord = existingRecords[0];
        await this.updateRecord(existingRecord.id, record);
        console.log(`✅ Updated DNS record: ${record.name}`);
      } else {
        // Create new record
        await this.createRecord(record);
        console.log(`✅ Created DNS record: ${record.name}`);
      }
    } catch (error) {
      console.error(
        `❌ Failed to create/update DNS record ${record.name}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Get existing DNS records
   */
  async getRecords(name = null) {
    try {
      let url = `${this.baseURL}/zones/${this.zoneId}/dns_records`;
      if (name) {
        url += `?name=${name}`;
      }

      const response = await axios.get(url, { headers: this.headers });
      return response.data.result;
    } catch (error) {
      console.error("Failed to get DNS records:", error.message);
      throw error;
    }
  }

  /**
   * Create new DNS record
   */
  async createRecord(record) {
    try {
      const response = await axios.post(
        `${this.baseURL}/zones/${this.zoneId}/dns_records`,
        {
          type: record.type,
          name: record.name,
          content: record.content,
          comment: record.comment,
          proxied: false, // Direct connection for tunnels
          ttl: 1, // Automatic TTL
        },
        { headers: this.headers }
      );
      return response.data.result;
    } catch (error) {
      console.error(
        "Failed to create DNS record:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Update existing DNS record
   */
  async updateRecord(recordId, record) {
    try {
      const response = await axios.put(
        `${this.baseURL}/zones/${this.zoneId}/dns_records/${recordId}`,
        {
          type: record.type,
          name: record.name,
          content: record.content,
          comment: record.comment,
          proxied: false,
          ttl: 1,
        },
        { headers: this.headers }
      );
      return response.data.result;
    } catch (error) {
      console.error(
        "Failed to update DNS record:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Delete DNS record
   */
  async deleteRecord(recordId) {
    try {
      await axios.delete(
        `${this.baseURL}/zones/${this.zoneId}/dns_records/${recordId}`,
        { headers: this.headers }
      );
      console.log(`✅ Deleted DNS record: ${recordId}`);
    } catch (error) {
      console.error("Failed to delete DNS record:", error.message);
      throw error;
    }
  }

  /**
   * Setup all Nyra DNS records
   */
  async setupAllRecords() {
    console.log("🚀 Setting up Nyra DNS records...");

    const records = this.getDNSRecords();
    const results = [];

    for (const record of records) {
      try {
        await this.createOrUpdateRecord(record);
        results.push({ success: true, record: record.name });
      } catch (error) {
        results.push({
          success: false,
          record: record.name,
          error: error.message,
        });
      }
    }

    console.log("\n📊 DNS Setup Results:");
    results.forEach((result) => {
      if (result.success) {
        console.log(`✅ ${result.record}`);
      } else {
        console.log(`❌ ${result.record}: ${result.error}`);
      }
    });

    return results;
  }

  /**
   * Validate DNS configuration
   */
  async validateConfiguration() {
    console.log("🔍 Validating DNS configuration...");

    const records = this.getDNSRecords();
    const issues = [];

    for (const record of records) {
      try {
        const existingRecords = await this.getRecords(record.name);

        if (existingRecords.length === 0) {
          issues.push(`Missing DNS record: ${record.name}`);
        } else {
          const existing = existingRecords[0];
          if (existing.content !== record.content) {
            issues.push(
              `Incorrect content for ${record.name}: expected ${record.content}, got ${existing.content}`
            );
          }
        }
      } catch (error) {
        issues.push(`Failed to check ${record.name}: ${error.message}`);
      }
    }

    if (issues.length === 0) {
      console.log("✅ All DNS records are correctly configured");
    } else {
      console.log("❌ DNS configuration issues found:");
      issues.forEach((issue) => console.log(`  - ${issue}`));
    }

    return issues;
  }

  /**
   * Export DNS configuration for backup
   */
  async exportConfiguration() {
    try {
      const records = await this.getRecords();
      const nyraRecords = records.filter(
        (record) =>
          record.name.includes("ratehunter.net") &&
          (record.name.includes("nyra") ||
            record.name.includes("orchestrator") ||
            record.name.includes("worker") ||
            record.name.includes("api") ||
            record.name.includes("health"))
      );

      const exportData = {
        exported: new Date().toISOString(),
        zone: "ratehunter.net",
        records: nyraRecords,
      };

      const exportPath = path.join(
        __dirname,
        "../../../config/dns-backup.json"
      );
      await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2));
      console.log(`✅ DNS configuration exported to: ${exportPath}`);

      return exportData;
    } catch (error) {
      console.error("Failed to export DNS configuration:", error.message);
      throw error;
    }
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const manager = new CloudflareDNSManager();

  (async () => {
    try {
      switch (command) {
        case "setup":
          await manager.setupAllRecords();
          break;
        case "validate":
          await manager.validateConfiguration();
          break;
        case "export":
          await manager.exportConfiguration();
          break;
        case "list":
          const records = await manager.getRecords();
          console.log(JSON.stringify(records, null, 2));
          break;
        default:
          console.log(`
Usage: node dns-manager.js <command>

Commands:
  setup     - Create/update all Nyra DNS records
  validate  - Validate current DNS configuration
  export    - Export DNS configuration to backup file
  list      - List all DNS records in zone
          `);
      }
    } catch (error) {
      console.error("Command failed:", error.message);
      process.exit(1);
    }
  })();
}

module.exports = CloudflareDNSManager;
