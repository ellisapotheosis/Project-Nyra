import React, { useState, useEffect } from 'react';
import { BootstrapConfig } from '../App';

interface Props {
  config: BootstrapConfig;
  nextStep: () => void;
  prevStep: () => void;
}

interface ServiceStatus {
  name: string;
  status: string;
  healthy: boolean;
}

const HealthCheckScreen: React.FC<Props> = ({ nextStep, prevStep }) => {
  const [checking, setChecking] = useState(false);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [allHealthy, setAllHealthy] = useState(false);

  useEffect(() => {
    runHealthCheck();
  }, []);

  const runHealthCheck = async () => {
    setChecking(true);

    try {
      const result = await window.bootstrap.healthCheck();

      if (result.success) {
        setServices(result.services);
        setAllHealthy(result.services.every((s: ServiceStatus) => s.healthy));
      }
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setChecking(false);
    }
  };

  const healthyCount = services.filter(s => s.healthy).length;
  const totalCount = services.length;

  return (
    <div className="screen-container">
      <h2>Service Health Check</h2>

      <div className="health-summary">
        <div className={`health-score ${allHealthy ? 'healthy' : 'unhealthy'}`}>
          <div className="score-number">{healthyCount}/{totalCount}</div>
          <div className="score-label">Services Healthy</div>
        </div>

        {allHealthy ? (
          <div className="success-message">
            <h3>✓ All Services Healthy</h3>
            <p>Your cluster is ready to use!</p>
          </div>
        ) : (
          <div className="warning-message">
            <h3>⚠️ Some Services Need Attention</h3>
            <p>Review the services below and troubleshoot any issues.</p>
          </div>
        )}
      </div>

      <div className="services-status">
        <h3>Service Status:</h3>
        <div className="status-list">
          {services.map((service, index) => (
            <div key={index} className={`status-item ${service.healthy ? 'healthy' : 'unhealthy'}`}>
              <span className="status-icon">
                {service.healthy ? '✓' : '✗'}
              </span>
              <div className="status-details">
                <div className="service-name">{service.name}</div>
                <div className="service-status">{service.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!allHealthy && (
        <div className="troubleshooting">
          <h4>Troubleshooting Tips:</h4>
          <ul>
            <li>Wait 1-2 minutes for services to fully start</li>
            <li>Check Docker logs: <code>docker compose logs [service-name]</code></li>
            <li>Verify port availability: <code>netstat -ano | findstr :[port]</code></li>
            <li>Ensure sufficient disk space and memory</li>
            <li>Restart unhealthy services: <code>docker compose restart [service-name]</code></li>
          </ul>
        </div>
      )}

      <div className="button-group">
        <button className="btn-secondary" onClick={prevStep}>
          ← Back
        </button>
        <button
          className="btn-secondary"
          onClick={runHealthCheck}
          disabled={checking}
        >
          {checking ? 'Checking...' : '🔄 Re-check Health'}
        </button>
        <button
          className="btn-primary"
          onClick={nextStep}
          disabled={!allHealthy}
        >
          Complete Setup →
        </button>
      </div>

      {!allHealthy && (
        <div className="force-continue">
          <button className="btn-link" onClick={nextStep}>
            Continue anyway (not recommended)
          </button>
        </div>
      )}

      {checking && (
        <div className="progress-indicator">
          <div className="spinner"></div>
          <p>Running health checks...</p>
        </div>
      )}
    </div>
  );
};

export default HealthCheckScreen;
