// NEW: Generate docker-compose files dynamically instead of requiring them to exist

// Helper function to generate docker-compose.yml for different roles
function generateDockerCompose(role: string, config?: any): string {
  const baseServices = {
    orchestrator: \
version: '3.9'

services:
  # Core services for orchestrator
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: nyra
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # AI/ML services
  litellm:
    image: ghcr.io/berriai/litellm:main
    environment:
      LITELLM_MASTER_KEY: sk-master-key
      REDIS_HOST: redis
      POSTGRES_HOST: postgres
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  # Orchestration
  claude-flow:
    image: ruvnet/claude-flow:latest
    environment:
      PC_NAME: \
      PC_ROLE: \
      LAN_IP: \
      POSTGRES_HOST: postgres
      REDIS_HOST: redis
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

volumes:
  postgres_data:

networks:
  default:
    name: nyra_network
    \,
    worker: \
version: '3.9'

services:
  # GPU/Inference services for workers
  ollama:
    image: ollama/ollama:latest
    environment:
      PC_NAME: \
      PC_ROLE: \
      LAN_IP: \
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:11434/api/tags"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis for caching
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # GPU monitoring
  gpu-monitor:
    image: ruvnet/gpu-monitor:latest
    environment:
      REDIS_HOST: redis
      PC_NAME: \
      PC_ROLE: \
    depends_on:
      redis:
        condition: service_healthy

volumes:
  ollama_data:

networks:
  default:
    name: nyra_network
    \
  };

  return baseServices[role] || baseServices.worker;
}

// NEW IPC Handler: Generate and deploy compose
ipcMain.handle('deploy-services', async (event, config: {
  role: string;
  ip: string;
  projectRoot?: string;  // NEW: Allow specifying project root
  useExisting?: boolean;  // NEW: Use existing compose if available
}) => {
  try {
    // Determine project root
    let projectRoot = config.projectRoot;
    if (!projectRoot) {
      // NEW: Allow running from bootstrap folder or anywhere
      // Try to find project root by looking for key markers
      let searchPath = process.cwd();
      let found = false;

      // Search up to 5 levels up
      for (let i = 0; i < 5; i++) {
        if (fs.existsSync(path.join(searchPath, 'infra')) && 
            fs.existsSync(path.join(searchPath, 'bootstrap'))) {
          projectRoot = searchPath;
          found = true;
          break;
        }
        searchPath = path.dirname(searchPath);
      }

      if (!found) {
        // If not found, use current working directory
        projectRoot = process.cwd();
        mainWindow?.webContents.send('deployment-progress', {
          stage: 'config',
          message: 'Warning: Could not auto-detect project root, using current directory'
        });
      }
    }

    mainWindow?.webContents.send('deployment-progress', {
      stage: 'config',
      message: \Using project root: \\
    });

    // NEW: Create infra directory if it doesn't exist
    const infraDir = path.join(projectRoot, 'infra');
    if (!fs.existsSync(infraDir)) {
      fs.mkdirSync(infraDir, { recursive: true });
    }

    // NEW: Generate docker-compose files dynamically
    let composeFile = 'docker-compose.yml';
    let composeContent = generateDockerCompose(config.role);

    // NEW: Option to use role-specific file names
    if (config.role !== 'default') {
      composeFile = \docker-compose.\.yml\;
    }

    const composePath = path.join(infraDir, composeFile);

    // NEW: Only generate if doesn't exist or useExisting is false
    if (!fs.existsSync(composePath) || config.useExisting === false) {
      await fs.writeFile(composePath, composeContent);
      mainWindow?.webContents.send('deployment-progress', {
        stage: 'config',
        message: \Generated docker-compose file: \\
      });
    } else {
      mainWindow?.webContents.send('deployment-progress', {
        stage: 'config',
        message: \Using existing docker-compose file: \\
      });
    }

    // FIXED: Merge .env instead of overwriting
    const envPath = path.join(projectRoot, '.env');
    let existingEnv: { [key: string]: string } = {};

    try {
      const existingContent = await fs.readFile(envPath, 'utf-8');
      existingContent.split('\\n').forEach(line => {
        if (line && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=');
          if (key) {
            existingEnv[key] = valueParts.join('=');
          }
        }
      });
    } catch (e) {
      // .env doesn't exist, start fresh
    }

    // Add bootstrap values (preserve existing)
    const bootstrapValues = {
      PC_NAME: config.role,
      PC_ROLE: config.role,
      LAN_IP: config.ip,
      NODE_ENV: existingEnv.NODE_ENV || 'production',
      LOG_LEVEL: existingEnv.LOG_LEVEL || 'info'
    };

    const mergedEnv = { ...existingEnv, ...bootstrapValues };
    const envContent = Object.entries(mergedEnv)
      .map(([key, value]) => \\=\\)
      .join('\\n');

    await fs.writeFile(envPath, envContent);
    mainWindow?.webContents.send('deployment-progress', {
      stage: 'config',
      message: 'Environment configuration saved (existing values preserved)'
    });

    // Pull images
    mainWindow?.webContents.send('deployment-progress', {
      stage: 'pull',
      message: 'Pulling Docker images...'
    });
    const composeFilePath = path.join(projectRoot, 'infra', composeFile);
    await execAsync(\docker compose -f \ pull\);

    // Start services
    mainWindow?.webContents.send('deployment-progress', {
      stage: 'start',
      message: 'Starting services...'
    });
    await execAsync(\docker compose -f \ up -d\);

    // Wait for health checks
    mainWindow?.webContents.send('deployment-progress', {
      stage: 'health',
      message: 'Waiting for services to stabilize...'
    });
    await new Promise(resolve => setTimeout(resolve, 30000));

    return {
      success: true,
      message: 'Services deployed successfully',
      details: {
        projectRoot,
        composeFile,
        role: config.role,
        ip: config.ip
      }
    };
  } catch (error: any) {
    console.error('Service deployment failed:', error);
    return {
      success: false,
      message: error.message
    };
  }
});
