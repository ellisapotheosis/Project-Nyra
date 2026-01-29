import React, { useState } from 'react';
import { BootstrapConfig } from '../App';

interface Props {
  config: BootstrapConfig;
  updateConfig: (updates: Partial<BootstrapConfig>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

interface PackageStatus {
  name: string;
  installed: boolean;
  installing: boolean;
  error?: string;
}

const PrerequisitesScreen: React.FC<Props> = ({ config, updateConfig, nextStep, prevStep }) => {
  const [skipDocker, setSkipDocker] = useState(false);
  const [skipNodeJS, setSkipNodeJS] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [packages, setPackages] = useState<PackageStatus[]>([
    { name: 'Git', installed: false, installing: false },
    { name: 'Node.js', installed: false, installing: false },
    { name: 'Docker Desktop', installed: false, installing: false },
    { name: 'Cloudflared', installed: false, installing: false },
    { name: 'Tailscale', installed: false, installing: false },
    { name: 'PowerShell 7', installed: false, installing: false }
  ]);
  const [result, setResult] = useState<any>(null);

  const handleInstall = async () => {
    setInstalling(true);
    setResult(null);

    try {
      const res = await window.bootstrap.installPrerequisites({
        skipDocker,
        skipNodeJS,
        silent: false
      });

      setResult(res);

      if (res.success) {
        // Update package status based on result
        setPackages(prev => prev.map(pkg => ({
          ...pkg,
          installed: true,
          installing: false
        })));

        setTimeout(() => nextStep(), 2000);
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    } finally {
      setInstalling(false);
    }
  };

  const installedCount = packages.filter(p => p.installed).length;
  const totalCount = packages.length - (skipDocker ? 1 : 0) - (skipNodeJS ? 1 : 0);
  const progress = totalCount > 0 ? (installedCount / totalCount) * 100 : 0;

  return (
    <div className="screen-container">
      <h2>Install Prerequisites</h2>

      <div className="info-box">
        <h3>Required Software</h3>
        <p>The following packages will be installed automatically using Windows Package Manager (winget):</p>
      </div>

      <div className="package-checklist">
        {packages.map((pkg, idx) => (
          <div key={idx} className={`package-item ${pkg.installed ? 'installed' : ''} ${pkg.installing ? 'installing' : ''}`}>
            <div className="package-icon">
              {pkg.installed && '✓'}
              {pkg.installing && <div className="mini-spinner"></div>}
              {!pkg.installed && !pkg.installing && '○'}
            </div>
            <div className="package-info">
              <strong>{pkg.name}</strong>
              {pkg.error && <span className="error-text">{pkg.error}</span>}
            </div>
            {(pkg.name === 'Docker Desktop' || pkg.name === 'Node.js') && (
              <label className="skip-checkbox">
                <input
                  type="checkbox"
                  checked={pkg.name === 'Docker Desktop' ? skipDocker : skipNodeJS}
                  onChange={(e) => {
                    if (pkg.name === 'Docker Desktop') {
                      setSkipDocker(e.target.checked);
                    } else {
                      setSkipNodeJS(e.target.checked);
                    }
                  }}
                  disabled={installing}
                />
                <span>Skip (already installed)</span>
              </label>
            )}
          </div>
        ))}
      </div>

      {installing && (
        <div className="progress-section">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">
            Installing packages... ({installedCount}/{totalCount})
          </p>
        </div>
      )}

      {result && (
        <div className={`result-box ${result.success ? 'success' : 'error'}`}>
          <h4>{result.success ? '✓ Installation Complete' : '✗ Installation Failed'}</h4>
          <p>{result.message}</p>
          {result.stdout && (
            <details className="output-details">
              <summary>View Details</summary>
              <pre>{result.stdout}</pre>
            </details>
          )}
        </div>
      )}

      <div className="button-group">
        <button className="btn-secondary" onClick={prevStep} disabled={installing}>
          ← Back
        </button>
        <button
          className="btn-primary"
          onClick={handleInstall}
          disabled={installing}
        >
          {installing ? 'Installing...' : 'Install Prerequisites →'}
        </button>
      </div>

      <div className="skip-option">
        <button className="btn-link" onClick={nextStep} disabled={installing}>
          Skip (I have these installed)
        </button>
      </div>

      {installing && (
        <div className="progress-indicator">
          <div className="spinner"></div>
          <p>This may take several minutes. Please do not close this window.</p>
        </div>
      )}
    </div>
  );
};

export default PrerequisitesScreen;
