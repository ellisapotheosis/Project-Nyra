import React, { useState, useEffect } from 'react';
import { BootstrapConfig } from '../App';

interface Props {
  config: BootstrapConfig;
  updateConfig: (updates: Partial<BootstrapConfig>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const SERVICE_MAPPINGS = {
  orchestrator: [
    { name: 'api', port: 3000, description: 'Main API Gateway' },
    { name: 'quote-api', port: 3001, description: 'Quote Generation API' },
    { name: 'admin-api', port: 3002, description: 'Admin Panel API' },
    { name: 'grafana', port: 3003, description: 'Monitoring Dashboard' },
    { name: 'prometheus', port: 9090, description: 'Metrics Collection' },
    { name: 'loki', port: 3100, description: 'Log Aggregation' },
    { name: 'jaeger', port: 16686, description: 'Distributed Tracing' },
    { name: 'secrets', port: 8200, description: 'Vault UI' },
    { name: 'nexus', port: 12008, description: 'Nexus Router' },
    { name: 'claude-flow', port: 8051, description: 'Claude Flow Server' },
    { name: 'pgadmin', port: 5050, description: 'Database Admin' },
    { name: 'redis', port: 8001, description: 'Redis Commander' },
    { name: 'ratehunter', port: 80, description: 'RateHunter Web App' },
    { name: 'admin', port: 3005, description: 'Admin Console' },
    { name: 'crm', port: 3006, description: 'CRM Dashboard' },
    { name: 'mcp', port: 8050, description: 'MCP Server' }
  ],
  worker: [
    { name: 'ollama', port: 11434, description: 'Ollama API' },
    { name: 'worker-api', port: 8000, description: 'Worker Status API' }
  ]
};

const CloudflareSetupScreen: React.FC<Props> = ({ config, updateConfig, nextStep, prevStep }) => {
  const [domain, setDomain] = useState('ratehunter.net');
  const [tunnelName, setTunnelName] = useState('');
  const [skipDNS, setSkipDNS] = useState(false);
  const [setting, setSetting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Auto-generate tunnel name based on role
    if (config.role) {
      setTunnelName(`nyra-${config.role}`);
    }
  }, [config.role]);

  const handleSetup = async () => {
    setSetting(true);
    setResult(null);

    try {
      const res = await window.bootstrap.setupCloudflareTunnel({
        role: config.role,
        domain,
        tunnelName,
        skipInstall: false,
        skipDNS
      });

      setResult(res);

      if (res.success) {
        updateConfig({
          cloudflareTunnelId: res.tunnelId,
          cloudflareDomain: domain
        });
        setTimeout(() => nextStep(), 2000);
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    } finally {
      setSetting(false);
    }
  };

  const isOrchestrator = config.role === 'orchestrator' || config.role === 'orchestrator-mini';
  const services = isOrchestrator ? SERVICE_MAPPINGS.orchestrator : SERVICE_MAPPINGS.worker;

  return (
    <div className="screen-container">
      <h2>Cloudflare Tunnel Setup</h2>

      <div className="info-box">
        <h3>Why Cloudflare Tunnel?</h3>
        <p>Secure public access to your services without opening firewall ports:</p>
        <ul>
          <li>Automatic SSL/TLS encryption for all endpoints</li>
          <li>DDoS protection and Web Application Firewall (WAF)</li>
          <li>No exposed ports - tunnels connect outbound only</li>
          <li>DNS-based service routing (api.{domain}, grafana.{domain}, etc.)</li>
        </ul>
      </div>

      <div className="form-section">
        <div className="form-group">
          <label>Cloudflare Domain:</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            disabled={setting}
          />
          <p className="help-text">
            Your domain must be added to Cloudflare first at: <a href="https://dash.cloudflare.com" target="_blank">dash.cloudflare.com</a>
          </p>
        </div>

        <div className="form-group">
          <label>Tunnel Name:</label>
          <input
            type="text"
            value={tunnelName}
            onChange={(e) => setTunnelName(e.target.value)}
            placeholder="nyra-orchestrator"
            disabled={setting}
          />
          <p className="help-text">
            Identifies this tunnel in Cloudflare Zero Trust dashboard
          </p>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={skipDNS}
              onChange={(e) => setSkipDNS(e.target.checked)}
              disabled={setting}
            />
            <span>Skip DNS configuration (worker nodes)</span>
          </label>
          <p className="help-text">
            Check this if setting up a worker after the orchestrator
          </p>
        </div>
      </div>

      <div className="service-preview">
        <h3>Services to be exposed ({services.length}):</h3>
        <div className="service-grid">
          {services.map((service, idx) => (
            <div key={idx} className="service-card">
              <div className="service-name">{service.name}</div>
              <div className="service-url">{service.name}.{domain}</div>
              <div className="service-port">:{service.port}</div>
              <div className="service-desc">{service.description}</div>
            </div>
          ))}
        </div>
      </div>

      {result && (
        <div className={`result-box ${result.success ? 'success' : 'error'}`}>
          <h4>{result.success ? '✓ Tunnel Created' : '✗ Setup Failed'}</h4>
          <p>{result.message}</p>
          {result.success && result.tunnelId && (
            <div className="tunnel-info">
              <strong>Tunnel ID:</strong> {result.tunnelId}<br/>
              <strong>Status:</strong> Running as Windows Service<br/>
              {!skipDNS && <><strong>DNS Records:</strong> {services.length} subdomains configured</>}
            </div>
          )}
          {result.stdout && (
            <details className="output-details">
              <summary>View Setup Log</summary>
              <pre>{result.stdout}</pre>
            </details>
          )}
        </div>
      )}

      <div className="button-group">
        <button className="btn-secondary" onClick={prevStep} disabled={setting}>
          ← Back
        </button>
        <button
          className="btn-primary"
          onClick={handleSetup}
          disabled={setting || !domain || !tunnelName}
        >
          {setting ? 'Creating Tunnel...' : 'Setup Cloudflare Tunnel →'}
        </button>
      </div>

      <div className="skip-option">
        <button className="btn-link" onClick={nextStep} disabled={setting}>
          Skip Cloudflare (local network only)
        </button>
      </div>

      {setting && (
        <div className="progress-indicator">
          <div className="spinner"></div>
          <p>Creating tunnel and configuring routes. This will open a browser for authentication...</p>
        </div>
      )}
    </div>
  );
};

export default CloudflareSetupScreen;
