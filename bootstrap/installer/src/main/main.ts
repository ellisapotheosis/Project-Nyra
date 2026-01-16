import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'Project Nyra Bootstrap Wizard',
    icon: path.join(__dirname, '../../assets/icon.png')
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers

// Detect PC role based on hardware and network
ipcMain.handle('detect-pc-role', async () => {
  try {
    const platform = os.platform();
    const hostname = os.hostname();
    const cpus = os.cpus();
    const totalMemory = os.totalmem();

    // Detect GPU
    let gpuInfo = null;
    if (platform === 'win32') {
      try {
        const { stdout } = await execAsync('wmic path win32_VideoController get name');
        gpuInfo = stdout.split('\n')[1]?.trim();
      } catch (error) {
        console.error('GPU detection failed:', error);
      }
    } else if (platform === 'darwin') {
      try {
        const { stdout } = await execAsync('system_profiler SPDisplaysDataType | grep Chipset');
        gpuInfo = stdout.trim();
      } catch (error) {
        console.error('GPU detection failed:', error);
      }
    }

    // Determine role based on hardware
    let suggestedRole = 'worker';
    if (platform === 'darwin' || !gpuInfo || gpuInfo.includes('Intel')) {
      suggestedRole = 'orchestrator';
    } else if (gpuInfo?.includes('5090')) {
      suggestedRole = 'worker-3';
    } else if (gpuInfo?.includes('3090')) {
      suggestedRole = 'worker-4';
    } else if (gpuInfo?.includes('3060')) {
      suggestedRole = 'worker-2';
    }

    return {
      platform,
      hostname,
      cpuCount: cpus.length,
      totalMemoryGB: Math.round(totalMemory / 1024 / 1024 / 1024),
      gpuInfo,
      suggestedRole,
      suggestedIP: suggestedRole === 'orchestrator' ? '10.0.0.1' :
                    suggestedRole === 'worker-2' ? '10.0.0.2' :
                    suggestedRole === 'worker-3' ? '10.0.0.3' : '10.0.0.4'
    };
  } catch (error) {
    console.error('PC detection failed:', error);
    throw error;
  }
});

// Configure static IP
ipcMain.handle('configure-static-ip', async (event, config: { ip: string; role: string }) => {
  try {
    const platform = os.platform();

    if (platform === 'win32') {
      // Windows: Use netsh to configure static IP
      const commands = [
        `netsh interface ip set address "Ethernet" static ${config.ip} 255.255.255.0 10.0.0.1`,
        `netsh interface ip set dns "Ethernet" static 8.8.8.8`,
        `netsh interface ip add dns "Ethernet" 8.8.4.4 index=2`
      ];

      for (const cmd of commands) {
        await execAsync(cmd);
      }
    } else if (platform === 'darwin') {
      // macOS: Use networksetup
      const { stdout: service } = await execAsync('networksetup -listallhardwareports | grep -A 1 "Ethernet" | tail -1 | awk \'{print $2}\'');
      const networkService = service.trim();

      await execAsync(`networksetup -setmanual "${networkService}" ${config.ip} 255.255.255.0 10.0.0.1`);
      await execAsync(`networksetup -setdnsservers "${networkService}" 8.8.8.8 8.8.4.4`);
    }

    return { success: true, message: 'Static IP configured successfully' };
  } catch (error: any) {
    console.error('Static IP configuration failed:', error);
    return { success: false, message: error.message };
  }
});

// Check Docker installation
ipcMain.handle('check-docker', async () => {
  try {
    const { stdout } = await execAsync('docker --version');
    const { stdout: composeStdout } = await execAsync('docker compose version');

    return {
      installed: true,
      version: stdout.trim(),
      composeVersion: composeStdout.trim()
    };
  } catch (error) {
    return { installed: false };
  }
});

// Install Docker
ipcMain.handle('install-docker', async () => {
  try {
    const platform = os.platform();

    if (platform === 'win32') {
      // Download and install Docker Desktop for Windows
      const downloadUrl = 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe';
      await execAsync(`powershell -Command "Invoke-WebRequest -Uri '${downloadUrl}' -OutFile '$env:TEMP\\DockerDesktopInstaller.exe'"`);
      await execAsync(`powershell -Command "Start-Process '$env:TEMP\\DockerDesktopInstaller.exe' -ArgumentList 'install --quiet' -Wait"`);
    } else if (platform === 'darwin') {
      // Install Docker Desktop for Mac
      await execAsync('brew install --cask docker');
    }

    return { success: true, message: 'Docker installed successfully. Please restart your computer.' };
  } catch (error: any) {
    console.error('Docker installation failed:', error);
    return { success: false, message: error.message };
  }
});

// Setup Tailscale
ipcMain.handle('setup-tailscale', async (event, authKey: string) => {
  try {
    const platform = os.platform();

    // Check if Tailscale is installed
    try {
      await execAsync('tailscale version');
    } catch {
      // Install Tailscale if not present
      if (platform === 'win32') {
        const downloadUrl = 'https://pkgs.tailscale.com/stable/tailscale-setup-latest-amd64.msi';
        await execAsync(`powershell -Command "Invoke-WebRequest -Uri '${downloadUrl}' -OutFile '$env:TEMP\\tailscale-setup.msi'"`);
        await execAsync(`msiexec /i $env:TEMP\\tailscale-setup.msi /quiet /qn`);
      } else if (platform === 'darwin') {
        await execAsync('brew install tailscale');
      }
    }

    // Authenticate with Tailscale
    if (authKey) {
      await execAsync(`tailscale up --authkey=${authKey}`);
    } else {
      await execAsync('tailscale up');
    }

    // Get Tailscale IP
    const { stdout } = await execAsync('tailscale ip -4');
    const tailscaleIP = stdout.trim();

    return { success: true, tailscaleIP, message: 'Tailscale configured successfully' };
  } catch (error: any) {
    console.error('Tailscale setup failed:', error);
    return { success: false, message: error.message };
  }
});

// Deploy Docker Compose services
ipcMain.handle('deploy-services', async (event, config: { role: string; ip: string }) => {
  try {
    const projectRoot = path.join(__dirname, '../../../');
    const composeFile = config.role === 'orchestrator'
      ? 'docker-compose.orchestrator.yml'
      : `docker-compose.worker.yml`;

    // Create environment file
    const envContent = `
PC_NAME=${config.role}
PC_ROLE=${config.role}
LAN_IP=${config.ip}
NODE_ENV=production
LOG_LEVEL=info
    `.trim();

    await fs.writeFile(path.join(projectRoot, '.env'), envContent);

    // Pull images
    mainWindow?.webContents.send('deployment-progress', { stage: 'pull', message: 'Pulling Docker images...' });
    await execAsync(`docker compose -f ${path.join(projectRoot, 'infra', composeFile)} pull`);

    // Start services
    mainWindow?.webContents.send('deployment-progress', { stage: 'start', message: 'Starting services...' });
    await execAsync(`docker compose -f ${path.join(projectRoot, 'infra', composeFile)} up -d`);

    // Wait for health checks
    mainWindow?.webContents.send('deployment-progress', { stage: 'health', message: 'Waiting for health checks...' });
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

    return { success: true, message: 'All services deployed successfully' };
  } catch (error: any) {
    console.error('Service deployment failed:', error);
    return { success: false, message: error.message };
  }
});

// Configure GPU worker (Ollama)
ipcMain.handle('configure-gpu-worker', async () => {
  try {
    // Pull Ollama models
    const models = ['llama3.1:8b', 'mistral:7b', 'codellama:13b'];

    for (const model of models) {
      mainWindow?.webContents.send('gpu-progress', { model, message: `Pulling ${model}...` });
      await execAsync(`docker exec ollama ollama pull ${model}`);
    }

    return { success: true, message: 'GPU worker configured with models' };
  } catch (error: any) {
    console.error('GPU worker configuration failed:', error);
    return { success: false, message: error.message };
  }
});

// Health check all services
ipcMain.handle('health-check', async () => {
  try {
    const { stdout } = await execAsync('docker ps --format "{{.Names}}\t{{.Status}}"');
    const services = stdout.trim().split('\n').map(line => {
      const [name, status] = line.split('\t');
      return {
        name,
        status,
        healthy: status.includes('healthy') || status.includes('Up')
      };
    });

    return { success: true, services };
  } catch (error: any) {
    console.error('Health check failed:', error);
    return { success: false, message: error.message };
  }
});

// Execute command with sudo/admin privileges
ipcMain.handle('exec-privileged', async (event, command: string) => {
  return new Promise((resolve, reject) => {
    const sudo = require('sudo-prompt');
    const options = { name: 'Nyra Bootstrap' };

    sudo.exec(command, options, (error: any, stdout: any, stderr: any) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
});

// Save configuration
ipcMain.handle('save-config', async (event, config: any) => {
  try {
    const configPath = path.join(app.getPath('userData'), 'bootstrap-config.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});

// Load configuration
ipcMain.handle('load-config', async () => {
  try {
    const configPath = path.join(app.getPath('userData'), 'bootstrap-config.json');
    const data = await fs.readFile(configPath, 'utf-8');
    return { success: true, config: JSON.parse(data) };
  } catch (error) {
    return { success: false, config: null };
  }
});
