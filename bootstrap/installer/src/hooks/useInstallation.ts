import { useState, useCallback, useRef } from 'react';
import { useInstallStore } from '../store/installStore';
import { createInstallOrchestrator, InstallOrchestrator } from '../services';
import { InstallPhase, LogEntry } from '../types/manifest';

export interface UseInstallationReturn {
  isInstalling: boolean;
  startInstallation: () => Promise<void>;
  retryInstallation: () => Promise<void>;
  rollbackInstallation: () => Promise<void>;
}

/**
 * Hook for managing installation process with orchestrator
 */
export function useInstallation(): UseInstallationReturn {
  const {
    selectedPC,
    enabledComponents,
    setPhase,
    setProgress,
    addLog,
    addError,
    setInstalling,
    currentPhase,
  } = useInstallStore();

  const [isInstalling, setIsInstallingLocal] = useState(false);
  const orchestratorRef = useRef<InstallOrchestrator | null>(null);

  /**
   * Start the installation process
   */
  const startInstallation = useCallback(async () => {
    if (!selectedPC) {
      addError(new Error('No PC selected'));
      return;
    }

    if (enabledComponents.size === 0) {
      addError(new Error('No components selected'));
      return;
    }

    setIsInstallingLocal(true);
    setInstalling(true);
    setPhase('validation');

    try {
      // Create orchestrator with callbacks
      const orchestrator = createInstallOrchestrator({
        pcId: selectedPC,
        components: Array.from(enabledComponents),
        backup: true,
        force: false,
        onProgress: (phase: InstallPhase, progress: number, step: number, total: number) => {
          setProgress(progress);
          addLog({
            level: 'info',
            message: `Phase: ${phase}`,
            component: 'Orchestrator',
            details: `Step ${step}/${total} - ${progress.toFixed(0)}%`,
          });
        },
        onLog: (log: LogEntry) => {
          addLog(log);
        },
        onPhaseChange: (phase: InstallPhase) => {
          setPhase(phase);
          addLog({
            level: 'info',
            message: `Entering phase: ${phase}`,
            component: 'Orchestrator',
          });
        },
      });

      // Store orchestrator reference for rollback
      orchestratorRef.current = orchestrator;

      // Run installation
      const result = await orchestrator.install();

      if (result.success) {
        addLog({
          level: 'success',
          message: 'Installation completed successfully!',
          component: 'Orchestrator',
        });
        setPhase('complete');
      } else {
        addError(result.error || new Error(result.message));
        setPhase('error');
      }
    } catch (error) {
      addError(error as Error);
      setPhase('error');
    } finally {
      setIsInstallingLocal(false);
      setInstalling(false);
    }
  }, [
    selectedPC,
    enabledComponents,
    setPhase,
    setProgress,
    addLog,
    addError,
    setInstalling,
  ]);

  /**
   * Retry the installation from the beginning
   */
  const retryInstallation = useCallback(async () => {
    addLog({
      level: 'info',
      message: 'Retrying installation...',
      component: 'User',
    });

    // Reset state
    orchestratorRef.current = null;
    setProgress(0);

    // Start fresh installation
    await startInstallation();
  }, [addLog, setProgress, startInstallation]);

  /**
   * Rollback the installation using backups
   */
  const rollbackInstallation = useCallback(async () => {
    if (!orchestratorRef.current) {
      addLog({
        level: 'warn',
        message: 'No installation to rollback',
        component: 'User',
      });
      return;
    }

    setIsInstallingLocal(true);
    setInstalling(true);

    addLog({
      level: 'info',
      message: 'Starting rollback...',
      component: 'Rollback',
    });

    try {
      const success = await orchestratorRef.current.rollback();

      if (success) {
        addLog({
          level: 'success',
          message: 'Rollback completed successfully',
          component: 'Rollback',
        });
        setPhase('selection');
      } else {
        addLog({
          level: 'warn',
          message: 'Rollback completed with warnings',
          component: 'Rollback',
          details: 'Some files may not have been rolled back',
        });
      }
    } catch (error) {
      addError(error as Error);
      addLog({
        level: 'error',
        message: 'Rollback failed',
        component: 'Rollback',
        details: (error as Error).message,
      });
    } finally {
      setIsInstallingLocal(false);
      setInstalling(false);
    }
  }, [addLog, addError, setPhase, setInstalling]);

  return {
    isInstalling,
    startInstallation,
    retryInstallation,
    rollbackInstallation,
  };
}
