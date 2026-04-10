# Bootstrap GUI Installer - Complete Implementation Guide

**Generated**: 2026-01-15
**Status**: 4 of 30 components implemented (13% complete)

## Executive Summary

This guide provides everything needed to complete the Bootstrap GUI Installer implementation. We've established the foundational patterns by implementing 4 critical components. The remaining 26 components follow these exact patterns.

---

## ✅ Completed Components (4/30)

### Services (2/13)
1. ✅ **hardwareDetector.ts** - Complete hardware detection (Windows + Linux/macOS)
   - Location: `bootstrap/installer/src/services/`
   - Platform-specific implementations: `hardwareDetector.windows.ts`, `hardwareDetector.linux.ts`
   - Detects: CPU, RAM, GPU (with VRAM), network interfaces (IP/MAC), disks

2. ✅ **wslInstaller.ts** - WSL2 installation and configuration
   - Location: `bootstrap/installer/src/services/`
   - Features: Install WSL2, configure .wslconfig, setup users, install Docker in WSL

### React Components (2/13)
1. ✅ **HardwareDetectionScreen.tsx** - Hardware detection display
   - Location: `bootstrap/installer/src/renderer/components/`
   - Displays CPU, RAM, GPU, network interfaces with real-time detection

2. ✅ **PCTypeConfirmationScreen.tsx** - PC type confirmation
   - Location: `bootstrap/installer/src/renderer/components/`
   - Auto-detects PC type, shows confidence, allows manual override

---

## 📋 Remaining Components (26/30)

### Services to Implement (11 files)
1. ❌ `networkConfigurator.ts` - Static IP configuration (netsh on Windows)
2. ❌ `cloudflaredInstaller.ts` - Cloudflared tunnel setup
3. ❌ `wakeOnLANConfigurator.ts` - Wake-on-LAN configuration
4. ❌ `infisicalInstaller.ts` - Infisical secrets management
5. ❌ `claudeInstaller.ts` - Claude Code/Desktop setup
6. ❌ `giteaInstaller.ts` - Gitea server (orchestrator only)
7. ❌ `databaseInitializer.ts` - PostgreSQL/Redis/MongoDB/AgentDB setup (orchestrator only)
8. ❌ `gpuDriverInstaller.ts` - NVIDIA driver installation
9. ❌ `koyebDeployer.ts` - Koyeb VPS deployment (orchestrator only)
10. ❌ `n8nDeployer.ts` - n8n workflow deployment (orchestrator only)
11. ❌ Enhanced `dockerInstaller.ts` - Add WSL integration

### React Components to Implement (13 files)
1. ❌ `WSLSetupScreen.tsx` - WSL2 setup wizard
2. ❌ Enhanced `NetworkConfigScreen.tsx` - Add static IP automation
3. ❌ `CloudflaredSetupScreen.tsx` - Cloudflared tunnel setup
4. ❌ `WakeOnLANSetupScreen.tsx` - WoL configuration
5. ❌ `InfisicalSetupScreen.tsx` - Infisical setup
6. ❌ `ClaudeSetupScreen.tsx` - Claude setup
7. ❌ `GiteaSetupScreen.tsx` - Gitea setup (orchestrator only)
8. ❌ `DatabaseSetupScreen.tsx` - Database initialization (orchestrator only)
9. ❌ Enhanced `GPUConfigScreen.tsx` - Add GPU driver installation
10. ❌ `KoyebSetupScreen.tsx` - Koyeb deployment (orchestrator only)
11. ❌ `N8NSetupScreen.tsx` - n8n workflow deployment (orchestrator only)
12. ❌ Updated `DockerSetupScreen.tsx` - Add WSL integration
13. ❌ Updated `App.tsx` - New 20-screen wizard flow

### Integration Files (2 files)
1. ❌ `bootstrap/installer/src/services/index.ts` - Export all new services
2. ❌ `bootstrap/installer/src/main/preload.ts` - Add electron IPC handlers

---

## 🎯 Implementation Pattern Templates

### Service Template

```typescript
/**
 * [Service Name] Service
 * [Brief description of what this service does]
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import { Logger, createLogger } from './logger';

const execAsync = promisify(exec);

export interface [ServiceName]Config {
  // Configuration options
  param1: string;
  param2?: number;
}

export interface [ServiceName]Status {
  installed: boolean;
  version?: string;
  // Other status fields
}

export interface [ServiceName]Result {
  success: boolean;
  message: string;
  requiresReboot?: boolean;
  details?: any;
}

export class [ServiceName]Installer {
  private logger: Logger;
  private platform: string;

  constructor(logger?: Logger) {
    this.logger = logger || createLogger({ component: '[ServiceName]Installer' });
    this.platform = os.platform();
  }

  /**
   * Check installation status
   */
  async checkStatus(): Promise<[ServiceName]Status> {
    this.logger.info('Checking [service name] status');

    try {
      // Check if service is installed
      // const { stdout } = await execAsync('command --version');

      return {
        installed: true,
        // version: extractedVersion,
      };
    } catch (error) {
      this.logger.info('[Service name] is not installed');
      return {
        installed: false,
      };
    }
  }

  /**
   * Install the service
   */
  async install(config: [ServiceName]Config): Promise<[ServiceName]Result> {
    this.logger.info('Starting [service name] installation');

    try {
      // Step 1: Download/prepare
      this.logger.info('Step 1: Description');
      // await execAsync('command');

      // Step 2: Install
      this.logger.info('Step 2: Description');
      // await execAsync('command');

      // Step 3: Configure
      this.logger.info('Step 3: Description');
      // await this.configure(config);

      this.logger.success('[Service name] installation completed');
      return {
        success: true,
        message: 'Installation successful',
        requiresReboot: false, // if needed
      };
    } catch (error: any) {
      this.logger.error('[Service name] installation failed', error.message);
      return {
        success: false,
        message: `Installation failed: ${error.message}`,
      };
    }
  }

  /**
   * Configure the service
   */
  async configure(config: [ServiceName]Config): Promise<[ServiceName]Result> {
    this.logger.info('Configuring [service name]');

    try {
      // Configuration logic
      this.logger.success('[Service name] configured');
      return {
        success: true,
        message: 'Configuration successful',
      };
    } catch (error: any) {
      this.logger.error('[Service name] configuration failed', error.message);
      return {
        success: false,
        message: `Configuration failed: ${error.message}`,
      };
    }
  }

  /**
   * Validate installation
   */
  async validate(): Promise<boolean> {
    this.logger.info('Validating [service name] installation');

    try {
      const status = await this.checkStatus();

      if (!status.installed) {
        this.logger.error('[Service name] is not installed');
        return false;
      }

      // Additional validation checks
      this.logger.success('[Service name] validation passed');
      return true;
    } catch (error: any) {
      this.logger.error('[Service name] validation failed', error.message);
      return false;
    }
  }
}
```

### React Component Template

```typescript
import React, { useState, useEffect } from 'react';
import { BootstrapConfig } from '../App';

interface Props {
  config: BootstrapConfig;
  updateConfig: (updates: Partial<BootstrapConfig>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const [ServiceName]SetupScreen: React.FC<Props> = ({
  config,
  updateConfig,
  nextStep,
  prevStep,
}) => {
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState<any>(null);
  const [installing, setInstalling] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const result = await window.bootstrap.check[ServiceName]();
      setStatus(result);
      updateConfig({ [serviceName]Installed: result.installed });
    } catch (error: any) {
      console.error('[Service name] check failed:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleInstall = async () => {
    setInstalling(true);
    setResult(null);

    try {
      const result = await window.bootstrap.install[ServiceName]();
      setResult(result);

      if (result.success) {
        setTimeout(() => checkStatus(), 3000);
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    } finally {
      setInstalling(false);
    }
  };

  const handleContinue = () => {
    if (status?.installed) {
      nextStep();
    }
  };

  // Loading state
  if (checking) {
    return (
      <div className="screen-container">
        <h2>Checking [Service Name]...</h2>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="screen-container">
      <h2>[Service Name] Setup</h2>

      {status?.installed ? (
        <div className="success-box">
          <h3>✓ [Service Name] is Installed</h3>
          <p>Your system is ready.</p>
        </div>
      ) : (
        <div className="install-needed">
          <h3>[Service Name] Not Found</h3>
          <p>[Service Name] needs to be installed to continue.</p>

          <div className="info-box">
            <h4>What will be installed:</h4>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
              <li>Item 3</li>
            </ul>
          </div>

          {result && (
            <div className={`result-box ${result.success ? 'success' : 'error'}`}>
              <h4>{result.success ? '✓ Success' : '✗ Failed'}</h4>
              <p>{result.message}</p>
            </div>
          )}

          <button
            className="btn-primary btn-large"
            onClick={handleInstall}
            disabled={installing}
          >
            {installing ? 'Installing...' : 'Install [Service Name]'}
          </button>
        </div>
      )}

      <div className="button-group">
        <button className="btn-secondary" onClick={prevStep}>
          ← Back
        </button>
        {status?.installed && (
          <button className="btn-primary" onClick={handleContinue}>
            Continue →
          </button>
        )}
      </div>
    </div>
  );
};

export default [ServiceName]SetupScreen;
```

---

## 🔧 Electron IPC Handler Template

Add to `bootstrap/installer/src/main/preload.ts`:

```typescript
contextBridge.exposeInMainWorld('bootstrap', {
  // ... existing methods ...

  // Add new service methods
  check[ServiceName]: () => ipcRenderer.invoke('check:[service-name]'),
  install[ServiceName]: () => ipcRenderer.invoke('install:[service-name]'),
  configure[ServiceName]: (config: any) => ipcRenderer.invoke('configure:[service-name]', config),
  validate[ServiceName]: () => ipcRenderer.invoke('validate:[service-name]'),
});
```

Add to `bootstrap/installer/src/main/main.ts`:

```typescript
import { [ServiceName]Installer } from './services/[serviceName]Installer';

// ... in setupIPCHandlers function ...

ipcMain.handle('check:[service-name]', async () => {
  const installer = new [ServiceName]Installer();
  return await installer.checkStatus();
});

ipcMain.handle('install:[service-name]', async () => {
  const installer = new [ServiceName]Installer();
  return await installer.install({ /* default config */ });
});

ipcMain.handle('configure:[service-name]', async (event, config) => {
  const installer = new [ServiceName]Installer();
  return await installer.configure(config);
});

ipcMain.handle('validate:[service-name]', async () => {
  const installer = new [ServiceName]Installer();
  return await installer.validate();
});
```

---

## 📊 Complete Wizard Flow (20 Screens)

Update `App.tsx` to include all screens in this order:

```typescript
const SCREEN_FLOW = [
  'welcome',                    // ✅ Existing
  'hardware-detection',         // ✅ NEW - HardwareDetectionScreen
  'pc-type-confirmation',       // ✅ NEW - PCTypeConfirmationScreen
  'prerequisites',              // ❌ NEW - Check admin rights, disk space
  'wsl-setup',                  // ❌ NEW - WSLSetupScreen (Windows only)
  'docker-setup',               // ✅ Existing (enhance with WSL)
  'network-config',             // ✅ Existing (enhance with static IP)
  'tailscale-setup',            // ✅ Existing
  'cloudflared-setup',          // ❌ NEW - CloudflaredSetupScreen
  'gpu-config',                 // ✅ Existing (enhance with driver install) - workers only
  'wake-on-lan',                // ❌ NEW - WakeOnLANSetupScreen
  'infisical-setup',            // ❌ NEW - InfisicalSetupScreen
  'claude-setup',               // ❌ NEW - ClaudeSetupScreen
  // --- Orchestrator-only screens ---
  'gitea-setup',                // ❌ NEW - GiteaSetupScreen (orchestrator only)
  'database-setup',             // ❌ NEW - DatabaseSetupScreen (orchestrator only)
  'koyeb-setup',                // ❌ NEW - KoyebSetupScreen (orchestrator only)
  'n8n-setup',                  // ❌ NEW - N8NSetupScreen (orchestrator only)
  // --- All PCs ---
  'service-deployment',         // ✅ Existing
  'health-check',               // ✅ Existing
  'completion',                 // ✅ Existing
];
```

---

## 🎯 Next Steps

### Immediate Priority (Phase 1)
1. Implement `WSLSetupScreen.tsx` (uses existing `wslInstaller.ts`)
2. Implement `networkConfigurator.ts` + enhanced `NetworkConfigScreen.tsx`
3. Add IPC handlers for WSL and network services
4. Test WSL installation flow on Windows

### Medium Priority (Phase 2)
1. Implement Cloudflared, WoL, Infisical services and screens
2. Implement Claude installation service and screen
3. Implement GPU driver installer and enhanced GPU screen

### Low Priority (Phase 3)
1. Implement orchestrator-only services (Gitea, Database, Koyeb, n8n)
2. Implement orchestrator-only screens
3. Update App.tsx with complete flow and conditional logic

### Final Integration (Phase 4)
1. Update `services/index.ts` to export all services
2. Complete electron IPC handlers
3. Add state persistence with electron-store
4. End-to-end testing on all 4 PC types
5. Create user documentation

---

## 📝 Key Implementation Notes

1. **All services must**:
   - Use the Logger service for consistent logging
   - Return typed result objects (success, message, details)
   - Handle errors gracefully with user-friendly messages
   - Validate before and after operations
   - Support platform-specific implementations when needed

2. **All React components must**:
   - Follow existing screen patterns (DockerSetupScreen, WelcomeScreen)
   - Show loading states during operations
   - Display clear error messages
   - Provide retry functionality
   - Allow back/forward navigation
   - Store state in config via updateConfig()

3. **Orchestrator-only components**:
   - Check PC type before showing
   - Add conditional logic in App.tsx: `if (config.pcRole === 'orchestrator')`
   - Show "Skipped (Worker PC)" message for workers

4. **Windows-only components** (WSL):
   - Check platform: `if (os.platform() === 'win32')`
   - Show "Skipped (Not Windows)" for Linux/macOS

5. **Worker-only components** (GPU):
   - Check PC role: `if (config.pcRole === 'worker')`
   - Show "Skipped (Orchestrator PC)" message

---

## 🎉 Progress Tracking

**Completion**: 4/30 files (13%)

**Services**: 2/13 (15%)
**Components**: 2/13 (15%)
**Integration**: 0/2 (0%)
**Testing**: 0/4 PCs (0%)

---

**Generated**: 2026-01-15
**Last Updated**: 2026-01-15
**Maintainer**: Bootstrap Team
