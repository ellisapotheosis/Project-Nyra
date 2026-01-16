import React, { useState, useEffect } from 'react';
import { BootstrapConfig } from '../App';

interface Props {
  config: BootstrapConfig;
  updateConfig: (updates: Partial<BootstrapConfig>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

interface DetectionResult {
  platform: string;
  hostname: string;
  cpuCount: number;
  totalMemoryGB: number;
  gpuInfo: string | null;
  suggestedRole: string;
  suggestedIP: string;
}

const PCDetectionScreen: React.FC<Props> = ({ config, updateConfig, nextStep, prevStep }) => {
  const [detecting, setDetecting] = useState(true);
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedIP, setSelectedIP] = useState('');

  useEffect(() => {
    detectPC();
  }, []);

  const detectPC = async () => {
    setDetecting(true);
    try {
      const result = await window.bootstrap.detectPCRole();
      setDetection(result);
      setSelectedRole(result.suggestedRole);
      setSelectedIP(result.suggestedIP);
    } catch (error) {
      console.error('Detection failed:', error);
    } finally {
      setDetecting(false);
    }
  };

  const handleContinue = () => {
    if (detection) {
      updateConfig({
        role: selectedRole,
        ip: selectedIP,
        hostname: detection.hostname,
        platform: detection.platform,
        gpuInfo: detection.gpuInfo || undefined
      });
      nextStep();
    }
  };

  const roles = [
    {
      value: 'orchestrator',
      label: 'Orchestrator (PC1)',
      description: 'Mac Mini - Coordination, Claude Flow, Nexus, Letta, Mem0',
      ip: '10.0.0.1'
    },
    {
      value: 'worker-2',
      label: 'Worker 2 (PC2)',
      description: 'Alienware M15R7 - RTX 3060 12GB - TwentyCRM, n8n, Dify',
      ip: '10.0.0.2'
    },
    {
      value: 'worker-3',
      label: 'Worker 3 (PC3)',
      description: 'Alienware Area-51 - RTX 5090 32GB - Ollama, Neo4j, FalkorDB',
      ip: '10.0.0.3'
    },
    {
      value: 'worker-4',
      label: 'Worker 4 (PC4)',
      description: 'Desktop PC - RTX 3090 Ti 24GB - Observability (Prometheus, Grafana, Loki)',
      ip: '10.0.0.4'
    }
  ];

  if (detecting) {
    return (
      <div className="screen-container">
        <h2>Detecting Hardware...</h2>
        <div className="spinner"></div>
        <p>Analyzing your system configuration...</p>
      </div>
    );
  }

  return (
    <div className="screen-container">
      <h2>PC Hardware Detection</h2>

      {detection && (
        <>
          <div className="detection-results">
            <h3>Detected Configuration:</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Platform:</label>
                <span>{detection.platform === 'win32' ? 'Windows' : 'macOS'}</span>
              </div>
              <div className="info-item">
                <label>Hostname:</label>
                <span>{detection.hostname}</span>
              </div>
              <div className="info-item">
                <label>CPU Cores:</label>
                <span>{detection.cpuCount}</span>
              </div>
              <div className="info-item">
                <label>Total Memory:</label>
                <span>{detection.totalMemoryGB} GB</span>
              </div>
              <div className="info-item full-width">
                <label>GPU:</label>
                <span>{detection.gpuInfo || 'No dedicated GPU detected (integrated graphics)'}</span>
              </div>
            </div>
          </div>

          <div className="role-selection">
            <h3>Select PC Role:</h3>
            <p className="help-text">Based on your hardware, we suggest: <strong>{roles.find(r => r.value === detection.suggestedRole)?.label}</strong></p>

            <div className="role-options">
              {roles.map(role => (
                <div
                  key={role.value}
                  className={`role-card ${selectedRole === role.value ? 'selected' : ''} ${detection.suggestedRole === role.value ? 'recommended' : ''}`}
                  onClick={() => {
                    setSelectedRole(role.value);
                    setSelectedIP(role.ip);
                  }}
                >
                  {detection.suggestedRole === role.value && (
                    <div className="recommended-badge">Recommended</div>
                  )}
                  <h4>{role.label}</h4>
                  <p className="role-description">{role.description}</p>
                  <div className="role-ip">IP: {role.ip}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="ip-override">
            <h4>Static IP Address:</h4>
            <input
              type="text"
              value={selectedIP}
              onChange={(e) => setSelectedIP(e.target.value)}
              placeholder="10.0.0.1"
              pattern="^10\.0\.0\.[1-4]$"
            />
            <p className="help-text">IP must be 10.0.0.1 through 10.0.0.4</p>
          </div>

          <div className="button-group">
            <button className="btn-secondary" onClick={prevStep}>
              ← Back
            </button>
            <button
              className="btn-primary"
              onClick={handleContinue}
              disabled={!selectedRole || !selectedIP}
            >
              Continue →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PCDetectionScreen;
