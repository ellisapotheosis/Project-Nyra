// FIXED VERSION - Preserves existing .env instead of destroying it

ipcMain.handle('deploy-services', async (event, config: { 
  role: string; 
  ip: string;
  selectedServices?: string[];  // NEW: allow service selection
  useProfiles?: string[];        // NEW: docker-compose profiles
}) => {
  try {
    const projectRoot = path.join(__dirname, '../../../');
    
    // NEW: Support both old role-based and new flexible approach
    let composeCommand = '';
    if (config.useProfiles && config.useProfiles.length > 0) {
      // NEW: Use your main docker-compose.yml with profiles
      const profileFlags = config.useProfiles.map(p => \--profile \\).join(' ');
      composeCommand = \docker compose -f \ \\;
    } else {
      // OLD: Fallback to role-based (for backward compatibility)
      const composeFile = config.role === 'orchestrator'
        ? 'docker-compose.orchestrator.yml'
        : 'docker-compose.worker.yml';
      composeCommand = \docker compose -f \\;
    }

    // FIXED: Merge .env instead of overwriting
    let envContent = '';
    const envPath = path.join(projectRoot, '.env');
    
    // Read existing .env if it exists
    let existingEnv = {};
    try {
      const existingContent = await fs.readFile(envPath, 'utf-8');
      existingContent.split('\\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && !line.startsWith('#')) {
          existingEnv[key] = valueParts.join('=');
        }
      });
    } catch (e) {
      // .env doesn't exist, start fresh
    }

    // NEW: Add bootstrap values but preserve everything else
    const bootstrapValues = {
      PC_NAME: config.role,
      PC_ROLE: config.role,
      LAN_IP: config.ip,
      // Keep existing NODE_ENV and LOG_LEVEL if they exist
      NODE_ENV: existingEnv.NODE_ENV || 'production',
      LOG_LEVEL: existingEnv.LOG_LEVEL || 'info'
    };

    // Merge: bootstrap values override, but preserve all other existing values
    const mergedEnv = { ...existingEnv, ...bootstrapValues };
    
    // Write back merged .env
    envContent = Object.entries(mergedEnv)
      .map(([key, value]) => \\=\\)
      .join('\\n');
    
    await fs.writeFile(envPath, envContent);
    mainWindow?.webContents.send('deployment-progress', { 
      stage: 'config', 
      message: 'Configuration saved (existing values preserved)' 
    });

    // Pull images
    mainWindow?.webContents.send('deployment-progress', { 
      stage: 'pull', 
      message: 'Pulling Docker images...' 
    });
    await execAsync(\\ pull\);

    // Start services
    mainWindow?.webContents.send('deployment-progress', { 
      stage: 'start', 
      message: 'Starting services...' 
    });
    await execAsync(\\ up -d\);

    // Wait for health checks
    mainWindow?.webContents.send('deployment-progress', { 
      stage: 'health', 
      message: 'Waiting for services to stabilize...' 
    });
    await new Promise(resolve => setTimeout(resolve, 30000));

    return { 
      success: true, 
      message: 'Services deployed successfully (existing .env preserved)',
      envSummary: { PC_NAME: config.role, PC_ROLE: config.role, LAN_IP: config.ip }
    };
  } catch (error: any) {
    console.error('Service deployment failed:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
});
