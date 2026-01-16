import React, { useState, useEffect } from 'react';
import { BootstrapConfig } from '../App';

interface Props {
  config: BootstrapConfig;
  updateConfig: (updates: Partial<BootstrapConfig>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

interface DeploymentProgress {
  stage: string;
  message: string;
}

const ServiceDeploymentScreen: React.FC<Props> = ({ config, updateConfig, nextStep, prevStep }) => {
  const [deploying, setDeploying] = useState(false);
  const [progress, setProgress] = useState<DeploymentProgress[]>([]);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Listen for deployment progress events
    window.bootstrap.onDeploymentProgress((data: DeploymentProgress) => {
      setProgress(prev => [...prev, data]);
    });
  }, []);

  const getServicesForRole = (role: string) => {
    const serviceMap: Record<string, string[]> = {
      orchestrator: [
        'nexus-router (LLM Gateway)',
        'letta (Conversation Memory)',
        'mem0 (Universal Memory)',
        'claude-flow (Orchestrator)',
        'archon-os (Task Router)',
        'agentdb (Vector Database)',
        'ruvector (Memory Optimization)',
        'infisical (Secrets Management)'
      ],
      'worker-2': [
        'twentycrm (CRM System)',
        'n8n (Workflow Automation)',
        'dify (Chat UI)',
        'redis (Cache & Queue)',
        'postgresql (Database)',
        'qdrant (Vector Store)'
      ],
      'worker-3': [
        'ollama (Local LLM Inference)',
        'neo4j (Graph Database)',
        'falkordb (Knowledge Graph)',
        'weaviate (Vector Database)'
      ],
      'worker-4': [
        'prometheus (Metrics)',
        'grafana (Dashboards)',
        'loki (Log Aggregation)',
        'alertmanager (Alerts)',
        'node-exporter (System Metrics)',
        'cadvisor (Container Metrics)'
      ]
    };

    return serviceMap[role] || [];
  };

  const handleDeploy = async () => {
    setDeploying(true);
    setProgress([]);
    setResult(null);

    try {
      const res = await window.bootstrap.deployServices({
        role: config.role,
        ip: config.ip
      });

      setResult(res);

      if (res.success) {
        updateConfig({ servicesDeployed: true });
        setTimeout(() => nextStep(), 2000);
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    } finally {
      setDeploying(false);
    }
  };

  const services = getServicesForRole(config.role);

  return (
    <div className="screen-container">
      <h2>Service Deployment</h2>

      <div className="deployment-plan">
        <h3>Services to Deploy on {config.role}:</h3>
        <div className="services-list">
          {services.map((service, index) => (
            <div key={index} className="service-item">
              <span className="service-icon">📦</span>
              <span className="service-name">{service}</span>
            </div>
          ))}
        </div>
        <p className="service-count">{services.length} services total</p>
      </div>

      <div className="info-box">
        <h4>Deployment Process:</h4>
        <ol>
          <li>Pull Docker images from registries (~2-5GB download)</li>
          <li>Create Docker networks and volumes</li>
          <li>Start services in dependency order</li>
          <li>Wait for health checks to pass</li>
          <li>Validate service connectivity</li>
        </ol>
        <p className="estimate"><strong>Estimated time:</strong> 10-15 minutes</p>
      </div>

      {progress.length > 0 && (
        <div className="progress-log">
          <h4>Deployment Progress:</h4>
          <div className="log-entries">
            {progress.map((entry, index) => (
              <div key={index} className="log-entry">
                <span className="log-stage">[{entry.stage}]</span>
                <span className="log-message">{entry.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className={`result-box ${result.success ? 'success' : 'error'}`}>
          <h4>{result.success ? '✓ Deployment Complete' : '✗ Deployment Failed'}</h4>
          <p>{result.message}</p>
        </div>
      )}

      <div className="button-group">
        <button className="btn-secondary" onClick={prevStep} disabled={deploying}>
          ← Back
        </button>
        <button
          className="btn-primary"
          onClick={handleDeploy}
          disabled={deploying}
        >
          {deploying ? 'Deploying Services...' : 'Start Deployment →'}
        </button>
      </div>

      {deploying && (
        <div className="progress-indicator">
          <div className="spinner"></div>
          <p>Deploying services... This may take 10-15 minutes.</p>
        </div>
      )}
    </div>
  );
};

export default ServiceDeploymentScreen;
