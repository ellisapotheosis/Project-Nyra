/**
 * Hardware Detection Display Component
 * Shows detected hardware information in a nice UI
 */

import React, { useState, useEffect } from 'react';
import { HardwareInfo } from '../services/hardwareDetector';

interface Props {
  onDetectionComplete?: (hardware: HardwareInfo) => void;
  autoDetect?: boolean;
}

const HardwareDetectionDisplay: React.FC<Props> = ({
  onDetectionComplete,
  autoDetect = true
}) => {
  const [detecting, setDetecting] = useState(false);
  const [hardware, setHardware] = useState<HardwareInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (autoDetect) {
      detectHardware();
    }
  }, [autoDetect]);

  const detectHardware = async () => {
    setDetecting(true);
    setError(null);

    try {
      // Call the hardware detection service
      const detected = await window.bootstrap?.detectHardware?.();

      if (detected) {
        setHardware(detected);
        onDetectionComplete?.(detected);
      } else {
        throw new Error('Hardware detection returned no data');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Hardware detection failed: ${message}`);
      console.error('Hardware detection error:', err);
    } finally {
      setDetecting(false);
    }
  };

  if (detecting) {
    return (
      <div className="hardware-detection-container">
        <div className="detection-loading">
          <div className="spinner"></div>
          <h3>Detecting Hardware...</h3>
          <p>Analyzing your system configuration</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hardware-detection-container">
        <div className="detection-error">
          <h3>Detection Failed</h3>
          <p>{error}</p>
          <button onClick={detectHardware} className="btn-primary">
            Retry Detection
          </button>
        </div>
      </div>
    );
  }

  if (!hardware) {
    return (
      <div className="hardware-detection-container">
        <button onClick={detectHardware} className="btn-primary">
          Start Hardware Detection
        </button>
      </div>
    );
  }

  return (
    <div className="hardware-detection-container">
      <div className="hardware-section">
        <h3>🖥️ System Information</h3>
        <div className="info-grid">
          <InfoItem label="Hostname" value={hardware.system.hostname} />
          <InfoItem label="Platform" value={hardware.system.platform} />
          <InfoItem label="Version" value={hardware.system.platformVersion} />
          <InfoItem label="Architecture" value={hardware.system.architecture} />
        </div>
      </div>

      <div className="hardware-section">
        <h3>⚙️ CPU Information</h3>
        <div className="info-grid">
          <InfoItem label="Model" value={hardware.cpu.model} fullWidth />
          <InfoItem label="Cores" value={hardware.cpu.cores} />
          <InfoItem label="Threads" value={hardware.cpu.threads} />
          {hardware.cpu.vendor && <InfoItem label="Vendor" value={hardware.cpu.vendor} />}
          {hardware.cpu.maxFrequency && <InfoItem label="Max Frequency" value={hardware.cpu.maxFrequency} />}
        </div>
      </div>

      <div className="hardware-section">
        <h3>💾 Memory Information</h3>
        <div className="info-grid">
          <InfoItem label="Total RAM" value={`${hardware.ram.totalGB} GB`} />
          <InfoItem label="Type" value={hardware.ram.type} />
          {hardware.ram.speed && <InfoItem label="Speed" value={hardware.ram.speed} />}
        </div>

        {hardware.ram.modules.length > 0 && (
          <div className="ram-modules">
            <h4>Memory Modules:</h4>
            <div className="modules-list">
              {hardware.ram.modules.map((module, idx) => (
                <div key={idx} className="module-card">
                  <span className="module-size">{module.size}</span>
                  <span className="module-type">{module.type}</span>
                  {module.speed && <span className="module-speed">{module.speed}</span>}
                  {module.slot && <span className="module-slot">Slot: {module.slot}</span>}
                  {module.manufacturer && <span className="module-mfg">{module.manufacturer}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {hardware.gpus.length > 0 && (
        <div className="hardware-section">
          <h3>🎮 GPU Information</h3>
          <div className="gpu-list">
            {hardware.gpus.map((gpu, idx) => (
              <div key={idx} className="gpu-card">
                <div className="gpu-header">
                  <span className="gpu-vendor-badge" data-vendor={gpu.vendor.toLowerCase()}>
                    {gpu.vendor}
                  </span>
                  <span className="gpu-model">{gpu.model}</span>
                </div>
                <div className="gpu-details">
                  <InfoItem label="VRAM" value={gpu.vram} />
                  {gpu.driver && <InfoItem label="Driver" value={gpu.driver} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="hardware-section">
        <h3>🌐 Network Interfaces</h3>
        <div className="network-list">
          {hardware.networkInterfaces.map((iface, idx) => (
            <div key={idx} className={`network-card ${iface.isActive ? 'active' : 'inactive'}`}>
              <div className="network-header">
                <span className="network-name">{iface.name}</span>
                <span className="network-type-badge" data-type={iface.type.toLowerCase()}>
                  {iface.type}
                </span>
                {iface.isActive && <span className="status-badge active">Active</span>}
              </div>
              <div className="network-details">
                <InfoItem label="MAC Address" value={iface.macAddress} />
                {iface.ipv4 && <InfoItem label="IPv4" value={iface.ipv4} />}
                {iface.ipv6 && <InfoItem label="IPv6" value={iface.ipv6} copyable />}
                {iface.speed && <InfoItem label="Speed" value={iface.speed} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hardware-section">
        <div className="detection-timestamp">
          Detected at: {new Date(hardware.detectedAt).toLocaleString()}
        </div>
        <button onClick={detectHardware} className="btn-secondary">
          Re-detect Hardware
        </button>
      </div>
    </div>
  );
};

interface InfoItemProps {
  label: string;
  value: string | number;
  fullWidth?: boolean;
  copyable?: boolean;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, fullWidth, copyable }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`info-item ${fullWidth ? 'full-width' : ''}`}>
      <label>{label}:</label>
      <span className="value">
        {value}
        {copyable && (
          <button
            className="copy-btn"
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copied ? '✓' : '📋'}
          </button>
        )}
      </span>
    </div>
  );
};

export default HardwareDetectionDisplay;
