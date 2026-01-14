import React, { useState, useEffect } from 'react';
import { BootstrapConfig } from '../App';

interface Props {
  config: BootstrapConfig;
  updateConfig: (updates: Partial<BootstrapConfig>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const DockerSetupScreen: React.FC<Props> = ({ config, updateConfig, nextStep, prevStep }) => {
  const [checking, setChecking] = useState(true);
  const [dockerStatus, setDockerStatus] = useState<any>(null);
  const [installing, setInstalling] = useState(false);
  const [installResult, setInstallResult] = useState<any>(null);

  useEffect(() => {
    checkDocker();
  }, []);

  const checkDocker = async () => {
    setChecking(true);
    try {
      const status = await window.bootstrap.checkDocker();
      setDockerStatus(status);
      updateConfig({ dockerInstalled: status.installed });
    } catch (error) {
      console.error('Docker check failed:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleInstall = async () => {
    setInstalling(true);
    setInstallResult(null);

    try {
      const result = await window.bootstrap.installDocker();
      setInstallResult(result);

      if (result.success) {
        // Recheck after installation
        setTimeout(() => checkDocker(), 3000);
      }
    } catch (error: any) {
      setInstallResult({ success: false, message: error.message });
    } finally {
      setInstalling(false);
    }
  };

  const handleContinue = () => {
    if (dockerStatus?.installed) {
      nextStep();
    }
  };

  if (checking) {
    return (
      <div className="screen-container">
        <h2>Checking Docker Installation...</h2>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="screen-container">
      <h2>Docker Setup</h2>

      {dockerStatus?.installed ? (
        <div className="success-box">
          <h3>✓ Docker is Installed</h3>
          <div className="version-info">
            <p><strong>Docker Version:</strong> {dockerStatus.version}</p>
            <p><strong>Docker Compose:</strong> {dockerStatus.composeVersion}</p>
          </div>
          <p className="status-text">Your system is ready for container deployment.</p>
        </div>
      ) : (
        <div className="install-needed">
          <h3>Docker Not Found</h3>
          <p>Docker Desktop needs to be installed to continue.</p>

          <div className="info-box">
            <h4>What will be installed:</h4>
            <ul>
              <li>Docker Desktop (includes Docker Engine + Docker Compose)</li>
              <li>Container runtime and orchestration tools</li>
              <li>Docker CLI and management interfaces</li>
              <li>WSL 2 backend (Windows) or HyperKit (macOS)</li>
            </ul>
          </div>

          <div className="requirements-box">
            <h4>Requirements:</h4>
            <ul>
              <li>10GB free disk space</li>
              <li>Administrator privileges</li>
              <li>Internet connection (1-2GB download)</li>
              <li>Computer restart may be required</li>
            </ul>
          </div>

          {installResult && (
            <div className={`result-box ${installResult.success ? 'success' : 'error'}`}>
              <h4>{installResult.success ? '✓ Installation Complete' : '✗ Installation Failed'}</h4>
              <p>{installResult.message}</p>
              {installResult.success && (
                <p className="restart-notice">
                  <strong>Please restart your computer and run this wizard again.</strong>
                </p>
              )}
            </div>
          )}

          <button
            className="btn-primary btn-large"
            onClick={handleInstall}
            disabled={installing}
          >
            {installing ? 'Installing Docker...' : 'Install Docker Desktop'}
          </button>

          {installing && (
            <div className="progress-indicator">
              <div className="spinner"></div>
              <p>Downloading and installing Docker Desktop... This may take 5-10 minutes.</p>
            </div>
          )}
        </div>
      )}

      <div className="button-group">
        <button className="btn-secondary" onClick={prevStep}>
          ← Back
        </button>
        {dockerStatus?.installed && (
          <button className="btn-primary" onClick={handleContinue}>
            Continue →
          </button>
        )}
      </div>
    </div>
  );
};

export default DockerSetupScreen;
