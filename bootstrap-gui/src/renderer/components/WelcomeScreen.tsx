import React from 'react';
import { BootstrapConfig } from '../App';

interface Props {
  config: BootstrapConfig;
  updateConfig: (updates: Partial<BootstrapConfig>) => void;
  nextStep: () => void;
  prevStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const WelcomeScreen: React.FC<Props> = ({ nextStep }) => {
  return (
    <div className="screen-container welcome-screen">
      <div className="welcome-content">
        <h2>Welcome to Project Nyra Bootstrap Wizard</h2>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🖥️</div>
            <h3>4-PC Cluster Setup</h3>
            <p>Automated configuration for orchestrator and 3 GPU workers</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🐳</div>
            <h3>Docker Deployment</h3>
            <p>22+ microservices deployed with health monitoring</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Networking</h3>
            <p>Static IPs (10.0.0.x) + Tailscale mesh VPN</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>GPU Acceleration</h3>
            <p>Ollama models on RTX 3060, 5090, 3090 Ti</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>Dual Orchestration</h3>
            <p>Claude Flow (planning) + Archon OS (execution)</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Health Validation</h3>
            <p>Comprehensive service health checks and monitoring</p>
          </div>
        </div>

        <div className="info-box">
          <h4>What This Wizard Will Do:</h4>
          <ul>
            <li>✓ Detect your PC hardware and suggest optimal role</li>
            <li>✓ Configure static IP address (10.0.0.1-4)</li>
            <li>✓ Install and configure Docker + Docker Compose</li>
            <li>✓ Setup Tailscale VPN for secure mesh networking</li>
            <li>✓ Deploy all required microservices</li>
            <li>✓ Configure GPU workers with Ollama models (if applicable)</li>
            <li>✓ Validate all services are healthy and running</li>
            <li>✓ Provide connection details and next steps</li>
          </ul>
        </div>

        <div className="requirements-box">
          <h4>Requirements:</h4>
          <ul>
            <li>Administrator/sudo privileges</li>
            <li>Internet connection for downloads</li>
            <li>Windows 10/11 or macOS 12+</li>
            <li>10GB free disk space minimum</li>
            <li>For GPU workers: NVIDIA GPU with 12GB+ VRAM</li>
          </ul>
        </div>

        <button className="btn-primary btn-large" onClick={nextStep}>
          Start Bootstrap Process →
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
