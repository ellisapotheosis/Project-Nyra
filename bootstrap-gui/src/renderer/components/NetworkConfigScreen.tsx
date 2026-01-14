import React, { useState } from 'react';
import { BootstrapConfig } from '../App';

interface Props {
  config: BootstrapConfig;
  updateConfig: (updates: Partial<BootstrapConfig>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const NetworkConfigScreen: React.FC<Props> = ({ config, nextStep, prevStep }) => {
  const [configuring, setConfiguring] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleConfigure = async () => {
    setConfiguring(true);
    setResult(null);

    try {
      const res = await window.bootstrap.configureStaticIP({
        ip: config.ip,
        role: config.role
      });
      setResult(res);

      if (res.success) {
        setTimeout(() => nextStep(), 2000);
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    } finally {
      setConfiguring(false);
    }
  };

  return (
    <div className="screen-container">
      <h2>Network Configuration</h2>

      <div className="config-summary">
        <h3>Network Settings to Apply:</h3>
        <div className="config-table">
          <div className="config-row">
            <span className="config-label">PC Role:</span>
            <span className="config-value">{config.role}</span>
          </div>
          <div className="config-row">
            <span className="config-label">Static IP Address:</span>
            <span className="config-value">{config.ip}</span>
          </div>
          <div className="config-row">
            <span className="config-label">Subnet Mask:</span>
            <span className="config-value">255.255.255.0</span>
          </div>
          <div className="config-row">
            <span className="config-label">Gateway:</span>
            <span className="config-value">10.0.0.1</span>
          </div>
          <div className="config-row">
            <span className="config-label">DNS Servers:</span>
            <span className="config-value">8.8.8.8, 8.8.4.4</span>
          </div>
        </div>
      </div>

      <div className="warning-box">
        <h4>⚠️ Important:</h4>
        <ul>
          <li>This will change your network adapter settings</li>
          <li>Your current network connection may be temporarily interrupted</li>
          <li>Administrator privileges are required</li>
          <li>Make sure all 4 PCs are on the same physical network (switch/router)</li>
        </ul>
      </div>

      {result && (
        <div className={`result-box ${result.success ? 'success' : 'error'}`}>
          <h4>{result.success ? '✓ Success' : '✗ Error'}</h4>
          <p>{result.message}</p>
        </div>
      )}

      <div className="button-group">
        <button className="btn-secondary" onClick={prevStep} disabled={configuring}>
          ← Back
        </button>
        <button
          className="btn-primary"
          onClick={handleConfigure}
          disabled={configuring}
        >
          {configuring ? 'Configuring...' : 'Configure Network →'}
        </button>
      </div>

      {configuring && (
        <div className="progress-indicator">
          <div className="spinner"></div>
          <p>Applying network configuration...</p>
        </div>
      )}
    </div>
  );
};

export default NetworkConfigScreen;
