#!/usr/bin/env node
/**
 * TwentyCRM Setup Script
 * Initializes TwentyCRM with Nyra-specific configurations
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.blue}🔧 ${msg}${colors.reset}`)
}

const DOCKER_COMPOSE_DEV = 'docker-compose.dev.yml'
const DOCKER_COMPOSE_PROD = 'docker-compose.yml'

function execCommand(command, options = {}) {
  try {
    const output = execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
      ...options
    })
    return { success: true, output }
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout }
  }
}

function checkDockerInstallation() {
  log.step('Checking Docker installation...')

  const dockerCheck = execCommand('docker --version', { silent: true })
  if (!dockerCheck.success) {
    log.error('Docker is not installed or not accessible')
    log.info('Please install Docker: https://docs.docker.com/get-docker/')
    process.exit(1)
  }

  const composeCheck = execCommand('docker compose version', { silent: true })
  if (!composeCheck.success) {
    log.error('Docker Compose is not installed or not accessible')
    log.info('Please install Docker Compose: https://docs.docker.com/compose/install/')
    process.exit(1)
  }

  log.success('Docker and Docker Compose are available')
}

function createNexusNetwork() {
  log.step('Creating Nexus network for service communication...')

  // Check if network exists
  const networkCheck = execCommand('docker network ls --filter name=nexus-network --format "{{.Name}}"', { silent: true })
  if (networkCheck.success && networkCheck.output.trim() === 'nexus-network') {
    log.info('Nexus network already exists')
    return
  }

  const result = execCommand('docker network create nexus-network --driver bridge')
  if (result.success) {
    log.success('Created nexus-network for service communication')
  } else {
    log.warning('Could not create nexus-network, it might already exist')
  }
}

async function generateSecrets() {
  log.step('Generating secure secrets...')

  const crypto = await import('crypto')
  const generateSecret = () => crypto.randomBytes(32).toString('hex')

  const secrets = {
    TWENTY_DB_PASSWORD: generateSecret(),
    TWENTY_REDIS_PASSWORD: generateSecret(),
    TWENTY_ACCESS_TOKEN_SECRET: generateSecret(),
    TWENTY_LOGIN_TOKEN_SECRET: generateSecret(),
    TWENTY_REFRESH_TOKEN_SECRET: generateSecret(),
    TWENTY_FILE_TOKEN_SECRET: generateSecret(),
    TWENTY_WEBHOOK_SECRET: generateSecret()
  }

  // Write secrets to .env file
  const envPath = path.join(process.cwd(), '.env.twenty')
  const envContent = Object.entries(secrets)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n') + '\n'

  fs.writeFileSync(envPath, envContent)
  log.success('Generated secrets and saved to .env.twenty')
  log.warning('IMPORTANT: Keep .env.twenty secure and do not commit it to version control!')

  return secrets
}

async function setupDevelopmentEnvironment() {
  log.step('Setting up development environment...')

  // Start development services
  const result = execCommand(`docker compose -f ${DOCKER_COMPOSE_DEV} up -d`)
  if (!result.success) {
    log.error('Failed to start development environment')
    log.error(result.error)
    process.exit(1)
  }

  log.success('Development environment started')

  // Wait for services to be healthy
  log.step('Waiting for services to be ready...')
  let attempts = 0
  const maxAttempts = 30

  while (attempts < maxAttempts) {
    const healthCheck = execCommand('docker compose -f docker-compose.dev.yml ps --format json', { silent: true })
    if (healthCheck.success) {
      try {
        const services = JSON.parse('[' + healthCheck.output.replace(/}\n{/g, '},{') + ']')
        const allHealthy = services.every(service =>
          service.State === 'running' &&
          (service.Health === 'healthy' || service.Health === undefined)
        )

        if (allHealthy) {
          log.success('All services are healthy and ready')
          break
        }
      } catch (e) {
        // Continue waiting
      }
    }

    attempts++
    await new Promise(resolve => setTimeout(resolve, 2000))
    process.stdout.write('.')
  }

  if (attempts >= maxAttempts) {
    log.warning('Services may not be fully ready, continuing...')
  }
}

async function runDatabaseMigrations() {
  log.step('Running database migrations...')

  // Wait a bit for the database to be fully ready
  await new Promise(resolve => setTimeout(resolve, 5000))

  const result = execCommand('docker compose -f docker-compose.dev.yml exec -T twenty-crm-dev npm run database:migrate')
  if (result.success) {
    log.success('Database migrations completed')
  } else {
    log.warning('Database migrations may have failed, manual intervention might be needed')
    log.info('You can run migrations manually with: npm run migrate')
  }
}

async function seedDevelopmentData() {
  log.step('Seeding development data...')

  const result = execCommand('docker compose -f docker-compose.dev.yml exec -T twenty-crm-dev npm run database:seed')
  if (result.success) {
    log.success('Development data seeded')
  } else {
    log.warning('Data seeding may have failed, continuing...')
    log.info('You can seed data manually with: npm run seed')
  }
}

function displayCompletionInfo() {
  log.success('🎉 TwentyCRM setup completed!')
  console.log('')
  log.info('📋 Setup Summary:')
  console.log('   • TwentyCRM Development: http://localhost:3021')
  console.log('   • Database: PostgreSQL on port 5434')
  console.log('   • Redis: Redis on port 6381')
  console.log('')
  log.info('🚀 Available Commands:')
  console.log('   npm run dev       - Start development environment')
  console.log('   npm run stop      - Stop all services')
  console.log('   npm run logs      - View logs')
  console.log('   npm run health    - Check health status')
  console.log('   npm run reset     - Reset and restart services')
  console.log('')
  log.info('🔗 Integration:')
  console.log('   • GraphQL API: http://localhost:3021/graphql')
  console.log('   • REST API: http://localhost:3021/rest')
  console.log('   • Webhooks: http://localhost:3021/webhooks')
  console.log('')
  log.warning('🔐 Security: Review .env.twenty for generated secrets')
}

async function main() {
  console.log(`${colors.bright}${colors.magenta}`)
  console.log('╔══════════════════════════════════════╗')
  console.log('║        TwentyCRM Setup for Nyra      ║')
  console.log('╚══════════════════════════════════════╝')
  console.log(colors.reset)

  try {
    checkDockerInstallation()
    createNexusNetwork()

    const secrets = await generateSecrets()

    setupDevelopmentEnvironment()
    await runDatabaseMigrations()
    await seedDevelopmentData()

    displayCompletionInfo()

  } catch (error) {
    log.error('Setup failed:')
    console.error(error)
    process.exit(1)
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
