import React from 'react';
import { BootstrapConfig } from '../App';

interface Props {
  config: BootstrapConfig;
}

const CompletionScreen: React.FC<Props> = ({ config }) => {
  const getAccessURLs = (role: string, ip: string) => {
    const urls: Record<string, string[]> = {
      orchestrator: [
        `Nexus Router: http://${ip}:6000`,
        `Letta Memory: http://${ip}:8283`,
        `Mem0 API: http://${ip}:4321`,
        `Claude Flow Dashboard: http://${ip}:3010`,
        `Infisical: http://${ip}:8080`
      ],
      'worker-2': [
        `TwentyCRM: http://${ip}:3000`,
        `n8n Workflows: http://${ip}:5678`,
        `Dify Chat UI: http://${ip}:3001`,
        `Redis Commander: http://${ip}:8081`
      ],
      'worker-3': [
        `Ollama API: http://${ip}:11434`,
        `Neo4j Browser: http://${ip}:7474`,
        `FalkorDB: http://${ip}:6379`
      ],
      'worker-4': [
        `Grafana Dashboards: http://${ip}:3005`,
        `Prometheus: http://${ip}:9090`,
        `Loki: http://${ip}:3100`,
        `Alertmanager: http://${ip}:9093`
      ]
    };

    return urls[role] || [];
  };

  const urls = getAccessURLs(config.role, config.ip);

  return (
    <div className="screen-container completion-screen">
      <div className="completion-content">
        <div className="success-icon">🎉</div>
        <h2>Bootstrap Complete!</h2>
        <p className="success-message">
          Your {config.role} is now fully configured and ready to use.
        </p>

        <div className="config-summary">
          <h3>Configuration Summary:</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <label>Role:</label>
              <span>{config.role}</span>
            </div>
            <div className="summary-item">
              <label>LAN IP:</label>
              <span>{config.ip}</span>
            </div>
            {config.tailscaleIP && (
              <div className="summary-item">
                <label>Tailscale IP:</label>
                <span>{config.tailscaleIP}</span>
              </div>
            )}
            <div className="summary-item">
              <label>Hostname:</label>
              <span>{config.hostname}</span>
            </div>
            <div className="summary-item">
              <label>Platform:</label>
              <span>{config.platform === 'win32' ? 'Windows' : 'macOS'}</span>
            </div>
            {config.gpuInfo && (
              <div className="summary-item full-width">
                <label>GPU:</label>
                <span>{config.gpuInfo}</span>
              </div>
            )}
          </div>
        </div>

        <div className="access-urls">
          <h3>Service Access URLs:</h3>
          <div className="url-list">
            {urls.map((url, index) => (
              <div key={index} className="url-item">
                <span className="url-icon">🔗</span>
                <a href={url.split(': ')[1]} target="_blank" rel="noopener noreferrer">
                  {url}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="next-steps">
          <h3>Next Steps:</h3>
          <ol>
            <li>
              <strong>Verify All Services:</strong> Visit each service URL to confirm accessibility
            </li>
            <li>
              <strong>Configure Remaining PCs:</strong> Run this wizard on the other 3 PCs in your cluster
            </li>
            <li>
              <strong>Setup Environment Variables:</strong> Copy <code>master-.env.example</code> to <code>.env</code> and configure API keys
            </li>
            <li>
              <strong>Test LLM Routing:</strong> Send test request to Nexus Router to verify LLM providers
            </li>
            <li>
              <strong>Create First Workflow:</strong> Use n8n or Claude Flow to create your first mortgage automation workflow
            </li>
            <li>
              <strong>Configure TwentyCRM:</strong> Import lead pipelines and configure mortgage stages
            </li>
            <li>
              <strong>Setup Monitoring:</strong> Configure Grafana dashboards and Prometheus alerts
            </li>
          </ol>
        </div>

        <div className="documentation-links">
          <h3>Documentation:</h3>
          <ul>
            <li><a href="file:///C:/Dev/Projects/Repos/Project-Nyra/CLAUDE.md" target="_blank">Master CLAUDE.md</a></li>
            <li><a href="file:///C:/Dev/Projects/Repos/Project-Nyra/docs/environment/MASTER-ENV-VARS.md" target="_blank">Environment Variables Guide</a></li>
            <li><a href="file:///C:/Dev/Projects/Repos/Project-Nyra/README.md" target="_blank">Project README</a></li>
            <li><a href="file:///C:/Dev/Projects/Repos/Project-Nyra/4PC-DEPLOYMENT-GUIDE.md" target="_blank">4-PC Deployment Guide</a></li>
          </ul>
        </div>

        <div className="support-info">
          <h3>Need Help?</h3>
          <p>Check these resources:</p>
          <ul>
            <li>Docker logs: <code>docker compose logs -f</code></li>
            <li>Service health: <code>docker ps</code></li>
            <li>Network status: <code>docker network ls</code></li>
            <li>Master troubleshooting document (coming soon)</li>
          </ul>
        </div>

        <button className="btn-primary btn-large" onClick={() => window.location.reload()}>
          Finish & Close
        </button>

        <p className="completion-footer">
          Thank you for using Project Nyra Bootstrap Wizard!
        </p>
      </div>
    </div>
  );
};

export default CompletionScreen;
