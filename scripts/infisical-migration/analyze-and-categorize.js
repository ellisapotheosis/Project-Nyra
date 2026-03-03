#!/usr/bin/env node
/**
 * Infisical Secrets Migration Analyzer
 * Categorizes 397 variables from /shared into proper paths
 *
 * Usage: node analyze-and-categorize.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ENV_FILE = path.join(__dirname, '../../infisical-path-plan-kit/.env');
const OUTPUT_DIR = path.join(__dirname, '../../infisical-path-plan-kit/migration');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Path categorization rules
const PATH_RULES = {
  '/providers/anthropic': ['ANTHROPIC_'],
  '/providers/openai': ['OPENAI_', 'OPEN_AI_'],
  '/providers/google': ['GOOGLE_', 'GEMINI_', 'VERTEXAI_', 'VERTEX_AI_'],
  '/providers/openrouter': ['OPENROUTER_', 'OPEN_ROUTER_'],
  '/providers/deepseek': ['DEEPSEEK_', 'DEEP_SEEK_'],
  '/providers/mistral': ['MISTRAL_'],
  '/providers/perplexity': ['PERPLEXITY_', 'PPLX_'],
  '/providers/replicate': ['REPLICATE_'],
  '/providers/huggingface': ['HUGGINGFACE_', 'HUGGING_FACE_', 'HF_'],

  '/machines/orchestrator-mini': ['ORCHESTRATOR_', 'AREA51_'],
  '/machines/worker-rtx3060': ['WORKER_RTX3060_', 'PC2_', 'RTX3060_'],
  '/machines/worker-rtx5090': ['WORKER_RTX5090_', 'PC3_', 'RTX5090_'],
  '/machines/worker-rtx3090ti': ['WORKER_RTX3090TI_', 'PC4_', 'RTX3090TI_'],

  '/databases/postgres': ['POSTGRES_', 'POSTGRESQL_', 'PG_', 'DATABASE_URL', 'DB_'],
  '/databases/redis': ['REDIS_'],
  '/databases/qdrant': ['QDRANT_'],
  '/databases/supabase': ['SUPABASE_', 'NEXT_PUBLIC_SUPABASE_'],
  '/databases/mongodb': ['MONGODB_', 'MONGO_'],
  '/databases/falkordb': ['FALKORDB_', 'FALKOR_', 'NEO4J_'],
  '/databases/twentycrm': ['TWENTYCRM_', 'TWENTY_CRM_'],

  '/clients/claude-flow': ['CLAUDE_FLOW_'],
  '/clients/claude-code': ['CLAUDE_CODE_', 'CLAUDE_AUTO_', 'CLAUDE_BASH_', 'CLAUDE_ESCALATE_'],
  '/clients/agentic-flow': ['AGENTIC_FLOW_'],
  '/clients/agent-booster': ['AGENT_BOOSTER_'],
  '/clients/ruvector': ['RUVECTOR_'],
  '/clients/bitwarden': ['BITWARDEN_', 'BW_'],
  '/clients/infisical': ['INFISICAL_'],
  '/clients/nexusrouter': ['NEXUS_ROUTER_', 'NEXUSROUTER_', 'ROUTER_'],
  '/clients/letta': ['LETTA_'],
  '/clients/mem0': ['MEM0_'],
  '/clients/graphiti': ['GRAPHITI_'],
  '/clients/archon': ['ARCHON_'],
  '/clients/agentdb': ['AGENTDB_'],
  '/clients/docker': ['DOCKER_'],
  '/clients/cloudflare': ['CF_', 'CLOUDFLARE_'],
  '/clients/tailscale': ['TAILSCALE_'],
  '/clients/n8n': ['N8N_'],

  '/github': ['GITHUB_', 'GH_'],

  '/base/environment': ['NODE_ENV', 'ENV', 'ENVIRONMENT', 'TZ', 'LANG', 'LOG_LEVEL', 'DEBUG'],
  '/base/ports': ['PORT', '_PORT$'],
  '/base/paths': ['PATH', 'DIR', '_PATH$', '_DIR$'],
  '/base/features': ['ENABLED', 'ENABLE_', 'AUTO_', 'DISABLE_'],

  '/security/api-keys': ['API_KEY', '_KEY$', 'TOKEN', '_TOKEN$', 'SECRET', '_SECRET$'],
  '/security/auth': ['AUTH_', 'JWT_', 'SESSION_', 'COOKIE_'],
  '/security/encryption': ['ENCRYPTION_', 'CIPHER_', 'HASH_'],

  '/monitoring/metrics': ['METRICS_', 'TELEMETRY_', 'ANALYTICS_'],
  '/monitoring/logging': ['LOG_', 'LOGGER_', 'SENTRY_'],
  '/monitoring/prometheus': ['PROMETHEUS_'],
  '/monitoring/grafana': ['GRAFANA_'],
  '/monitoring/alertmanager': ['ALERTMANAGER_'],
  '/monitoring/cadvisor': ['CADVISOR_'],

  '/workflows/campaign': ['CAMPAIGN_'],
  '/workflows/mortgage': ['MORTGAGE_', 'LEAD_'],
};

// Read and parse .env file
function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const variables = [];

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip comments and empty lines
    if (!line || line.startsWith('#')) continue;

    // Parse KEY='VALUE' or KEY=VALUE
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/i);
    if (match) {
      const [, key, value] = match;
      variables.push({
        lineNumber: i + 1,
        key,
        value: value.replace(/^['"]|['"]$/g, ''), // Remove quotes
        originalLine: line
      });
    }
  }

  return variables;
}

// Categorize variables by path
function categorizeVariables(variables) {
  const categorized = {};
  const uncategorized = [];

  for (const variable of variables) {
    let assigned = false;

    // Try each path rule
    for (const [targetPath, prefixes] of Object.entries(PATH_RULES)) {
      for (const prefix of prefixes) {
        // Check if prefix ends with $ (regex pattern)
        if (prefix.endsWith('$')) {
          const pattern = new RegExp(prefix);
          if (pattern.test(variable.key)) {
            if (!categorized[targetPath]) categorized[targetPath] = [];
            categorized[targetPath].push(variable);
            assigned = true;
            break;
          }
        } else {
          // Simple prefix match
          if (variable.key.startsWith(prefix) || variable.key.includes(prefix)) {
            if (!categorized[targetPath]) categorized[targetPath] = [];
            categorized[targetPath].push(variable);
            assigned = true;
            break;
          }
        }
      }
      if (assigned) break;
    }

    if (!assigned) {
      uncategorized.push(variable);
    }
  }

  return { categorized, uncategorized };
}

// Generate migration report
function generateReport(categorized, uncategorized, totalCount) {
  let report = `# Infisical Migration Analysis Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n`;
  report += `Total Variables: ${totalCount}\n`;
  report += `Categorized: ${totalCount - uncategorized.length}\n`;
  report += `Uncategorized: ${uncategorized.length}\n\n`;

  report += `## Categorization Summary\n\n`;
  const sortedPaths = Object.keys(categorized).sort();
  for (const targetPath of sortedPaths) {
    const vars = categorized[targetPath];
    report += `### ${targetPath} (${vars.length} variables)\n\n`;
    for (const v of vars) {
      report += `- \`${v.key}\`\n`;
    }
    report += `\n`;
  }

  if (uncategorized.length > 0) {
    report += `## Uncategorized Variables (${uncategorized.length})\n\n`;
    report += `These variables need manual review:\n\n`;
    for (const v of uncategorized) {
      report += `- \`${v.key}\` (line ${v.lineNumber})\n`;
    }
    report += `\n`;
  }

  return report;
}

// Generate PowerShell migration script
function generateMigrationScript(categorized) {
  let script = `# Infisical Secrets Migration Script\n`;
  script += `# Generated: ${new Date().toISOString()}\n`;
  script += `# This script moves secrets from /shared to organized paths\n\n`;
  script += `$ErrorActionPreference = "Continue"\n`;
  script += `$ProjectId = "8374cea9-e5e8-4050-bda4-b91f25ab30ef"\n`;
  script += `$Env = "dev"\n`;
  script += `$Token = $env:INFISICAL_ACCESS_TOKEN\n\n`;
  script += `Write-Host "Starting Infisical migration..." -ForegroundColor Cyan\n`;
  script += `$totalCount = 0\n`;
  script += `$successCount = 0\n`;
  script += `$failCount = 0\n\n`;

  const sortedPaths = Object.keys(categorized).sort();

  for (const targetPath of sortedPaths) {
    const vars = categorized[targetPath];
    script += `\n# Migrate to ${targetPath} (${vars.length} variables)\n`;
    script += `Write-Host "\\n📁 Migrating to ${targetPath}..." -ForegroundColor Yellow\n`;

    for (const v of vars) {
      const escapedValue = v.value.replace(/'/g, "''").replace(/"/g, '`"');
      script += `$totalCount++\n`;
      script += `Write-Host "  Setting ${v.key}..." -NoNewline\n`;
      script += `try {\n`;
      script += `  infisical secrets set "${v.key}" "${escapedValue}" --path="${targetPath}" --env="$Env" --projectId="$ProjectId" --token="$Token" --silent 2>&1 | Out-Null\n`;
      script += `  Write-Host " ✓" -ForegroundColor Green\n`;
      script += `  $successCount++\n`;
      script += `} catch {\n`;
      script += `  Write-Host " ✗" -ForegroundColor Red\n`;
      script += `  Write-Host "    Error: $_" -ForegroundColor Red\n`;
      script += `  $failCount++\n`;
      script += `}\n`;
    }
  }

  script += `\n# Summary\n`;
  script += `Write-Host "\\n========================================" -ForegroundColor Cyan\n`;
  script += `Write-Host "Migration Complete!" -ForegroundColor Green\n`;
  script += `Write-Host "Total: $totalCount" -ForegroundColor White\n`;
  script += `Write-Host "Success: $successCount" -ForegroundColor Green\n`;
  script += `Write-Host "Failed: $failCount" -ForegroundColor Red\n`;
  script += `Write-Host "========================================" -ForegroundColor Cyan\n`;

  return script;
}

// Generate path structure JSON
function generatePathStructure(categorized) {
  const structure = {
    generated: new Date().toISOString(),
    paths: {}
  };

  for (const [targetPath, vars] of Object.entries(categorized)) {
    structure.paths[targetPath] = {
      count: vars.length,
      variables: vars.map(v => ({
        key: v.key,
        hasValue: !!v.value,
        lineNumber: v.lineNumber
      }))
    };
  }

  return JSON.stringify(structure, null, 2);
}

// Main execution
function main() {
  console.log('🔍 Analyzing Infisical secrets...\n');

  // Parse .env file
  const variables = parseEnvFile(ENV_FILE);
  console.log(`✓ Parsed ${variables.length} variables from .env file\n`);

  // Categorize
  const { categorized, uncategorized } = categorizeVariables(variables);
  console.log(`✓ Categorized ${variables.length - uncategorized.length} variables`);
  console.log(`⚠ ${uncategorized.length} variables need manual review\n`);

  // Generate outputs
  const report = generateReport(categorized, uncategorized, variables.length);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'MIGRATION-REPORT.md'), report);
  console.log(`✓ Generated: migration/MIGRATION-REPORT.md`);

  const script = generateMigrationScript(categorized);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'migrate-secrets.ps1'), script);
  console.log(`✓ Generated: migration/migrate-secrets.ps1`);

  const structure = generatePathStructure(categorized);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'path-structure.json'), structure);
  console.log(`✓ Generated: migration/path-structure.json`);

  console.log(`\n✅ Analysis complete! Check the migration/ folder for outputs.\n`);
}

main();
