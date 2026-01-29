import React, { useState, useEffect } from 'react';
import { BootstrapConfig } from '../App';

interface Props {
  config: BootstrapConfig;
  updateConfig: (updates: Partial<BootstrapConfig>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

interface GPUInfo {
  name: string;
  vramGB: number;
  supportsVLLM: boolean;
  recommendation: string;
}

const VLLM_MODELS = [
  { value: 'TheBloke/Llama-3-70B-Instruct-AWQ', label: 'Llama 3 70B AWQ (24-32GB)', vramRequired: 24 },
  { value: 'TheBloke/Llama-3-8B-Instruct-AWQ', label: 'Llama 3 8B AWQ (6-8GB)', vramRequired: 6 },
  { value: 'meta-llama/Llama-3.1-405B-Instruct-AWQ', label: 'Llama 3.1 405B AWQ (32GB+, needs tensor parallel)', vramRequired: 32 }
];

const OLLAMA_MODELS = [
  { value: 'llama3:8b', label: 'Llama 3 8B', sizeGB: 4.7 },
  { value: 'mistral:7b', label: 'Mistral 7B', sizeGB: 4.1 },
  { value: 'qwen2.5:32b', label: 'Qwen 2.5 32B', sizeGB: 18 },
  { value: 'llama3:70b-q4', label: 'Llama 3 70B Q4', sizeGB: 38 }
];

const VLLMSetupScreen: React.FC<Props> = ({ config, updateConfig, nextStep, prevStep }) => {
  const [detecting, setDetecting] = useState(false);
  const [gpuInfo, setGpuInfo] = useState<GPUInfo | null>(null);
  const [setupMode, setSetupMode] = useState<'vllm' | 'ollama' | null>(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedOllamaModels, setSelectedOllamaModels] = useState<string[]>(['llama3:8b']);
  const [enableLMCache, setEnableLMCache] = useState(true);
  const [redisHost, setRedisHost] = useState('orchestrator-mini');
  const [setting, setSetting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    detectGPU();
  }, []);

  const detectGPU = async () => {
    setDetecting(true);
    try {
      const info = await window.bootstrap.detectGPU();
      setGpuInfo(info);

      // Auto-select setup mode based on GPU
      if (info.supportsVLLM) {
        setSetupMode('vllm');
        // Auto-select appropriate model
        if (info.vramGB >= 32) {
          setSelectedModel(VLLM_MODELS[0].value);
        } else if (info.vramGB >= 24) {
          setSelectedModel(VLLM_MODELS[0].value);
        } else {
          setSelectedModel(VLLM_MODELS[1].value);
        }
      } else {
        setSetupMode('ollama');
      }
    } catch (error: any) {
      setGpuInfo({
        name: 'Detection failed',
        vramGB: 0,
        supportsVLLM: false,
        recommendation: 'Unable to detect GPU'
      });
    } finally {
      setDetecting(false);
    }
  };

  const handleSetupVLLM = async () => {
    setSetting(true);
    setResult(null);

    try {
      const res = await window.bootstrap.setupVLLM({
        workerID: config.hostname || 'worker-unknown',
        model: selectedModel,
        enableLMCache,
        redisHost,
        redisPort: 6379,
        maxModelLen: 4096,
        gpuMemoryUtilization: 0.95
      });

      setResult(res);

      if (res.success) {
        updateConfig({ 
          gpuInfo: `vLLM: ${selectedModel}`,
          lmCacheEnabled: enableLMCache 
        });
        setTimeout(() => nextStep(), 2000);
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    } finally {
      setSetting(false);
    }
  };

  const handleSetupOllama = async () => {
    setSetting(true);
    setResult(null);

    try {
      const res = await window.bootstrap.setupOllama({
        models: selectedOllamaModels
      });

      setResult(res);

      if (res.success) {
        updateConfig({ 
          gpuInfo: `Ollama: ${selectedOllamaModels.join(', ')}`
        });
        setTimeout(() => nextStep(), 2000);
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    } finally {
      setSetting(false);
    }
  };

  const handleSetup = setupMode === 'vllm' ? handleSetupVLLM : handleSetupOllama;

  const toggleOllamaModel = (modelValue: string) => {
    if (selectedOllamaModels.includes(modelValue)) {
      setSelectedOllamaModels(prev => prev.filter(m => m !== modelValue));
    } else {
      setSelectedOllamaModels(prev => [...prev, modelValue]);
    }
  };

  return (
    <div className="screen-container">
      <h2>GPU Inference Setup</h2>

      {detecting && (
        <div className="detecting-box">
          <div className="spinner"></div>
          <p>Detecting GPU hardware...</p>
        </div>
      )}

      {gpuInfo && !detecting && (
        <>
          <div className={`gpu-info-box ${gpuInfo.supportsVLLM ? 'vllm-capable' : 'ollama-only'}`}>
            <h3>Detected GPU</h3>
            <div className="gpu-details">
              <div className="gpu-name">{gpuInfo.name}</div>
              <div className="gpu-vram">{gpuInfo.vramGB}GB VRAM</div>
              <div className={`gpu-recommendation ${gpuInfo.supportsVLLM ? 'recommended' : 'fallback'}`}>
                {gpuInfo.recommendation}
              </div>
            </div>
          </div>

          <div className="setup-mode-selector">
            <h3>Select Inference Engine:</h3>
            <div className="mode-options">
              <label className={`mode-option ${setupMode === 'vllm' ? 'selected' : ''} ${!gpuInfo.supportsVLLM ? 'disabled' : ''}`}>
                <input
                  type="radio"
                  checked={setupMode === 'vllm'}
                  onChange={() => setSetupMode('vllm')}
                  disabled={!gpuInfo.supportsVLLM || setting}
                />
                <div>
                  <strong>vLLM + LMCache</strong>
                  <p>5-10x faster TTFT, 87-90% cache hit rate</p>
                  <p className="requirement">Requires 24GB+ VRAM</p>
                </div>
              </label>

              <label className={`mode-option ${setupMode === 'ollama' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  checked={setupMode === 'ollama'}
                  onChange={() => setSetupMode('ollama')}
                  disabled={setting}
                />
                <div>
                  <strong>Ollama</strong>
                  <p>Easy setup, good for development/testing</p>
                  <p className="requirement">Works with 12GB+ VRAM</p>
                </div>
              </label>
            </div>
          </div>

          {setupMode === 'vllm' && (
            <div className="vllm-config">
              <h3>vLLM Configuration</h3>
              
              <div className="form-group">
                <label>Model:</label>
                <select 
                  value={selectedModel} 
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={setting}
                >
                  {VLLM_MODELS.map(model => (
                    <option 
                      key={model.value} 
                      value={model.value}
                      disabled={model.vramRequired > gpuInfo.vramGB}
                    >
                      {model.label} {model.vramRequired > gpuInfo.vramGB && '(Insufficient VRAM)'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={enableLMCache}
                    onChange={(e) => setEnableLMCache(e.target.checked)}
                    disabled={setting}
                  />
                  <span>Enable LMCache (3-10x speedup)</span>
                </label>
                <p className="help-text">
                  Requires Redis on orchestrator. Expected 87-90% cache hit rate.
                </p>
              </div>

              {enableLMCache && (
                <div className="form-group">
                  <label>Redis Host:</label>
                  <input
                    type="text"
                    value={redisHost}
                    onChange={(e) => setRedisHost(e.target.value)}
                    placeholder="orchestrator-mini"
                    disabled={setting}
                  />
                  <p className="help-text">
                    Tailscale hostname or IP of orchestrator
                  </p>
                </div>
              )}
            </div>
          )}

          {setupMode === 'ollama' && (
            <div className="ollama-config">
              <h3>Ollama Models</h3>
              <p>Select one or more models to download:</p>
              
              <div className="model-checklist">
                {OLLAMA_MODELS.map(model => (
                  <label key={model.value} className="model-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedOllamaModels.includes(model.value)}
                      onChange={() => toggleOllamaModel(model.value)}
                      disabled={setting}
                    />
                    <div className="model-info">
                      <strong>{model.label}</strong>
                      <span className="model-size">{model.sizeGB}GB</span>
                    </div>
                  </label>
                ))}
              </div>

              <p className="total-size">
                Total download: {OLLAMA_MODELS
                  .filter(m => selectedOllamaModels.includes(m.value))
                  .reduce((sum, m) => sum + m.sizeGB, 0)
                  .toFixed(1)}GB
              </p>
            </div>
          )}

          {result && (
            <div className={`result-box ${result.success ? 'success' : 'error'}`}>
              <h4>{result.success ? '✓ Setup Complete' : '✗ Setup Failed'}</h4>
              <p>{result.message}</p>
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
              disabled={
                setting || 
                !setupMode || 
                (setupMode === 'vllm' && !selectedModel) ||
                (setupMode === 'ollama' && selectedOllamaModels.length === 0)
              }
            >
              {setting ? 'Installing...' : `Setup ${setupMode === 'vllm' ? 'vLLM' : 'Ollama'} →`}
            </button>
          </div>

          <div className="skip-option">
            <button className="btn-link" onClick={nextStep} disabled={setting}>
              Skip GPU Setup (orchestrator only)
            </button>
          </div>

          {setting && (
            <div className="progress-indicator">
              <div className="spinner"></div>
              <p>
                {setupMode === 'vllm' 
                  ? 'Pulling Docker image and downloading model weights. This may take 10-30 minutes...'
                  : 'Installing Ollama and downloading models. This may take 5-20 minutes...'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VLLMSetupScreen;
