import React, { useState, useEffect } from 'react';
import { BootstrapConfig } from '../App';

interface Props {
  config: BootstrapConfig;
  updateConfig: (updates: Partial<BootstrapConfig>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

interface GPUProgress {
  model: string;
  message: string;
}

const GPUConfigScreen: React.FC<Props> = ({ config, nextStep, prevStep }) => {
  const [configuring, setConfiguring] = useState(false);
  const [progress, setProgress] = useState<GPUProgress[]>([]);
  const [result, setResult] = useState<any>(null);

  const isGPUWorker = config.role !== 'orchestrator';

  useEffect(() => {
    // Listen for GPU progress events
    window.bootstrap.onGPUProgress((data: GPUProgress) => {
      setProgress(prev => [...prev, data]);
    });
  }, []);

  const handleConfigure = async () => {
    setConfiguring(true);
    setProgress([]);
    setResult(null);

    try {
      const res = await window.bootstrap.configureGPUWorker();
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

  const handleSkip = () => {
    nextStep();
  };

  if (!isGPUWorker) {
    return (
      <div className="screen-container">
        <h2>GPU Configuration</h2>

        <div className="info-box">
          <h3>GPU Configuration Not Required</h3>
          <p>Your role ({config.role}) does not require GPU worker configuration.</p>
          <p>This step is only necessary for worker PCs with NVIDIA GPUs running Ollama.</p>
        </div>

        <div className="button-group">
          <button className="btn-secondary" onClick={prevStep}>
            ← Back
          </button>
          <button className="btn-primary" onClick={nextStep}>
            Continue →
          </button>
        </div>
      </div>
    );
  }

  const models = [
    { name: 'llama3.1:8b', size: '4.7GB', use: 'General purpose chat and reasoning' },
    { name: 'mistral:7b', size: '4.1GB', use: 'Fast inference and code generation' },
    { name: 'codellama:13b', size: '7.3GB', use: 'Advanced code understanding and generation' }
  ];

  return (
    <div className="screen-container">
      <h2>GPU Worker Configuration</h2>

      <div className="gpu-info">
        <h3>Detected GPU:</h3>
        <p className="gpu-model">{config.gpuInfo || 'GPU information unavailable'}</p>
      </div>

      <div className="models-list">
        <h3>Models to Install:</h3>
        {models.map((model, index) => (
          <div key={index} className="model-card">
            <div className="model-header">
              <span className="model-name">{model.name}</span>
              <span className="model-size">{model.size}</span>
            </div>
            <p className="model-use">{model.use}</p>
          </div>
        ))}
        <p className="total-size">Total download: ~16GB</p>
      </div>

      <div className="info-box">
        <h4>What This Does:</h4>
        <ul>
          <li>Pulls Ollama models optimized for your GPU</li>
          <li>Configures CUDA for optimal inference</li>
          <li>Sets up model caching and memory management</li>
          <li>Validates GPU availability and performance</li>
        </ul>
        <p className="estimate"><strong>Estimated time:</strong> 15-20 minutes (depending on internet speed)</p>
      </div>

      {progress.length > 0 && (
        <div className="progress-log">
          <h4>Configuration Progress:</h4>
          <div className="log-entries">
            {progress.map((entry, index) => (
              <div key={index} className="log-entry">
                <span className="log-model">{entry.model}</span>
                <span className="log-message">{entry.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className={`result-box ${result.success ? 'success' : 'error'}`}>
          <h4>{result.success ? '✓ GPU Configured' : '✗ Configuration Failed'}</h4>
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
          {configuring ? 'Configuring GPU...' : 'Configure GPU Worker →'}
        </button>
      </div>

      <div className="skip-option">
        <button className="btn-link" onClick={handleSkip}>
          Skip GPU Configuration (configure manually later)
        </button>
      </div>

      {configuring && (
        <div className="progress-indicator">
          <div className="spinner"></div>
          <p>Pulling Ollama models... This may take 15-20 minutes.</p>
        </div>
      )}
    </div>
  );
};

export default GPUConfigScreen;
