#!/usr/bin/env node

/**
 * Project Nyra - Comprehensive Health Check
 * Validates all services, infrastructure, and dependencies
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

const STATUS = {
  OK: `${COLORS.green}✓ OK${COLORS.reset}`,
  FAIL: `${COLORS.red}✗ FAIL${COLORS.reset}`,
  WARN: `${COLORS.yellow}⚠ WARN${COLORS.reset}`,
  INFO: `${COLORS.blue}ℹ INFO${COLORS.reset}`
};

const checks = [];
let exitCode = 0;

async function runCheck(name, command, options = {}) {
  try {
    const { stdout, stderr } = await execPromise(command, { timeout: 10000 });
    const output = options.parser ? options.parser(stdout, stderr) : stdout.trim();

    if (options.validator) {
      const isValid = options.validator(output, stdout, stderr);
      if (isValid) {
        checks.push({ name, status: STATUS.OK, message: output || 'Healthy' });
      } else {
        checks.push({ name, status: STATUS.FAIL, message: options.failMessage || 'Check failed' });
        exitCode = 1;
      }
    } else {
      checks.push({ name, status: STATUS.OK, message: output || 'Healthy' });
    }
  } catch (error) {
    checks.push({
      name,
      status: options.optional ? STATUS.WARN : STATUS.FAIL,
      message: error.message || 'Service unavailable'
    });
    if (!options.optional) exitCode = 1;
  }
}

async function checkDockerServices() {
  console.log(`\n${COLORS.blue}=== Docker Services ===${COLORS.reset}`);

  const services = [
    { name: 'PostgreSQL', container: 'postgres', port: 5432 },
    { name: 'Redis', container: 'redis', port: 6379 },
    { name: 'RabbitMQ', container: 'rabbitmq', port: 5672 },
    { name: 'MinIO', container: 'minio', port: 9000 },
    { name: 'Vault', container: 'vault', port: 8200, optional: true }
  ];

  for (const service of services) {
    await runCheck(
      service.name,
      `docker ps --filter "name=${service.container}" --filter "status=running" --format "{{.Names}}: {{.Status}}"`,
      {
        optional: service.optional,
        validator: (output) => output.includes(service.container),
        failMessage: `${service.container} not running on port ${service.port}`
      }
    );
  }
}

async function checkNodeServices() {
  console.log(`\n${COLORS.blue}=== Node.js Services ===${COLORS.reset}`);

  await runCheck(
    'Node.js Version',
    'node --version',
    {
      validator: (output) => {
        const version = parseInt(output.replace('v', '').split('.')[0]);
        return version >= 20;
      },
      failMessage: 'Node.js version must be >= 20'
    }
  );

  await runCheck(
    'pnpm Version',
    'pnpm --version',
    {
      validator: (output) => {
        const version = parseInt(output.split('.')[0]);
        return version >= 9;
      },
      failMessage: 'pnpm version must be >= 9'
    }
  );

  await runCheck(
    'TypeScript',
    'npx tsc --version',
    { optional: true }
  );
}

async function checkClaudeFlow() {
  console.log(`\n${COLORS.blue}=== Claude Flow V3 ===${COLORS.reset}`);

  await runCheck(
    'Claude Flow CLI',
    'npx @archon-os/cli@latest --version',
    {
      validator: (output) => output.includes('3.0.0') || output.includes('alpha'),
      failMessage: 'Claude Flow V3 not installed'
    }
  );

  await runCheck(
    'MCP Server Status',
    'npx @archon-os/cli@latest mcp status',
    { optional: true }
  );

  await runCheck(
    'Memory Database',
    'npx @archon-os/cli@latest memory list --limit 1',
    { optional: true }
  );

  await runCheck(
    'Daemon Status',
    'npx @archon-os/cli@latest daemon status',
    { optional: true }
  );
}

async function checkNyraServices() {
  console.log(`\n${COLORS.blue}=== Nyra Core Services ===${COLORS.reset}`);

  await runCheck(
    'Nexus Router (6000)',
    "curl -s -o /dev/null -w '%{http_code}' http://localhost:6000/health",
    {
      validator: (code) => code.trim().startsWith('2'),
      failMessage: 'Nexus /health did not return 2xx'
    }
  );

  await runCheck(
    'LiteLLM Proxy (4000)',
    "curl -s -o /dev/null -w '%{http_code}' http://localhost:4000/health || curl -s -o /dev/null -w '%{http_code}' http://localhost:4000",
    {
      optional: true,
      validator: (code) => code && code.trim().startsWith('2'),
      failMessage: 'LiteLLM health check did not return 2xx'
    }
  );

  await runCheck(
    'Gitea (3005)',
    "curl -s -o /dev/null -w '%{http_code}' http://localhost:3005/",
    {
      optional: true,
      validator: (code) => code && (code.trim().startsWith('2') || code.trim().startsWith('3')),
      failMessage: 'Gitea UI not reachable on http://localhost:3005/'
    }
  );

  await runCheck(
    'OpenMemory MCP (8081)',
    "curl -s -o /dev/null -w '%{http_code}' http://localhost:8081/health || curl -s -o /dev/null -w '%{http_code}' http://localhost:8081",
    {
      optional: true,
      validator: (code) => code && code.trim().startsWith('2'),
      failMessage: 'OpenMemory MCP not responding on port 8081'
    }
  );
}

async function checkDatabase() {
  console.log(`\n${COLORS.blue}=== Database ===${COLORS.reset}`);

  await runCheck(
    'Prisma Schema',
    'test -f packages/database/prisma/schema.prisma && echo "Schema exists"',
    { optional: true }
  );

  await runCheck(
    'Database Connection',
    'docker exec postgres pg_isready -U postgres',
    {
      validator: (output) => output.includes('accepting connections'),
      failMessage: 'PostgreSQL not accepting connections'
    }
  );
}

async function checkInfrastructure() {
  console.log(`\n${COLORS.blue}=== Infrastructure ===${COLORS.reset}`);

  await runCheck(
    'Docker Daemon',
    'docker info --format "{{.ServerVersion}}"',
    {
      validator: (output) => output.length > 0,
      failMessage: 'Docker daemon not running'
    }
  );

  await runCheck(
    'Docker Compose',
    'docker-compose --version',
    {
      validator: (output) => output.includes('version'),
      failMessage: 'Docker Compose not installed'
    }
  );

  await runCheck(
    'Disk Space',
    'df -h . | tail -1',
    {
      parser: (output) => {
        const parts = output.split(/\s+/);
        const used = parts[4];
        return `${used} used`;
      },
      validator: (output) => {
        const percentage = parseInt(output.match(/(\d+)%/)?.[1] || '100');
        return percentage < 90;
      },
      failMessage: 'Disk space critical (>90% used)'
    }
  );
}

async function checkGitRepository() {
  console.log(`\n${COLORS.blue}=== Git Repository ===${COLORS.reset}`);

  await runCheck(
    'Git Status',
    'git status --porcelain',
    {
      optional: true,
      parser: (output) => {
        const changes = output.split('\n').filter(line => line.trim()).length;
        return changes > 0 ? `${changes} uncommitted changes` : 'Clean working directory';
      }
    }
  );

  await runCheck(
    'Current Branch',
    'git branch --show-current',
    { optional: true }
  );

  await runCheck(
    'Remote Status',
    'git remote -v | head -1',
    { optional: true }
  );
}

async function checkSecurityTools() {
  console.log(`\n${COLORS.blue}=== Security ===${COLORS.reset}`);

  await runCheck(
    'Infisical CLI',
    'which infisical',
    {
      optional: true,
      parser: () => 'Installed'
    }
  );

  await runCheck(
    'Security Scan',
    'npx @archon-os/cli@latest security scan --quick',
    { optional: true }
  );
}

async function printResults() {
  console.log(`\n${COLORS.blue}=== Health Check Summary ===${COLORS.reset}\n`);

  const okCount = checks.filter(c => c.status === STATUS.OK).length;
  const failCount = checks.filter(c => c.status === STATUS.FAIL).length;
  const warnCount = checks.filter(c => c.status === STATUS.WARN).length;

  checks.forEach(check => {
    console.log(`${check.status} ${check.name}: ${check.message}`);
  });

  console.log(`\n${COLORS.blue}Total Checks:${COLORS.reset} ${checks.length}`);
  console.log(`${COLORS.green}Passed:${COLORS.reset} ${okCount}`);
  console.log(`${COLORS.red}Failed:${COLORS.reset} ${failCount}`);
  console.log(`${COLORS.yellow}Warnings:${COLORS.reset} ${warnCount}`);

  if (exitCode === 0) {
    console.log(`\n${COLORS.green}✓ All critical health checks passed!${COLORS.reset}\n`);
  } else {
    console.log(`\n${COLORS.red}✗ Health check failed. Please review errors above.${COLORS.reset}\n`);
  }
}

async function main() {
  console.log(`${COLORS.blue}╔═══════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.blue}║  Project Nyra - Health Check         ║${COLORS.reset}`);
  console.log(`${COLORS.blue}╚═══════════════════════════════════════╝${COLORS.reset}`);

  try {
    await checkNodeServices();
    await checkDockerServices();
    await checkDatabase();
    await checkNyraServices();
    await checkClaudeFlow();
    await checkInfrastructure();
    await checkGitRepository();
    await checkSecurityTools();
    await printResults();
  } catch (error) {
    console.error(`\n${COLORS.red}Fatal error during health check:${COLORS.reset}`, error.message);
    exitCode = 1;
  }

  process.exit(exitCode);
}

if (require.main === module) {
  main();
}

module.exports = { runCheck, checkDockerServices, checkNodeServices };
