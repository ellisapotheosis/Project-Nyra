import React, { useState, useEffect } from 'react';
import { BootstrapConfig } from '../App';

interface Props {
  config: BootstrapConfig;
  updateConfig: (updates: Partial<BootstrapConfig>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

interface HardwareInfo {
  system: {
    hostname: string;
    platform: string;
    platformVersion: string;
    architecture: string;
  };
  cpu: {
    model: string;
    cores: number;
    threads: number;
    architecture: string;
    frequency?: string;
    maxFrequency?: string;
    vendor?: string;
  };
  ram: {
    totalGB: number;
    type: string;
    speed?: string;
    modules: Array<{
      size: string;
      type: string;
      speed?: string;
      manufacturer?: string;
      slot?: string;
    }>;
  };
  gpus: Array<{
    model: string;
    vram: string;
    driver?: string;
    vendor: string;
    isNvidia: boolean;
    isAMD: boolean;
    isIntel: boolean;
  }>;
  networkInterfaces: Array<{
    name: string;
    type: string;
    macAddress: string;
    ipv4?: string;
    ipv6?: string;
    isActive: boolean;
    speed?: string;
  }>;
  detectedAt: Date;
}

const HardwareDetectionScreen: React.FC<Props> = ({
  config,
  updateConfig,
  nextStep,
  prevStep,
}) => {
  const [detecting, setDetecting] = useState(true);
  const [hardware, setHardware] = useState<HardwareInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    detectHardware();
  }, []);

  const detectHardware = async () => {
    setDetecting(true);
    setError(null);

    try {
      // Call electron IPC to detect hardware
      const result = await window.bootstrap.detectHardware();
      setHardware(result);
      // Store in config for later use
      updateConfig({ hardwareInfo: result });
    } catch (err: any) {
      setError(err.message || 'Failed to detect hardware');
    } finally {
      setDetecting(false);
    }
  };

  const handleContinue = () => {
    if (hardware) {
      nextStep();
    }
  };

  if (detecting) {
    return (
      <div className="screen-container">
        <h2>Detecting Hardware</h2>
        <div className="text-center py-12">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">
            Scanning your system for CPU, RAM, GPU, and network hardware...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This may take a few seconds
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="screen-container">
        <h2>Hardware Detection Failed</h2>
        <div className="error-box">
          <h3>⚠️ Detection Error</h3>
          <p>{error}</p>
        </div>
        <div className="button-group">
          <button className="btn-secondary" onClick={prevStep}>
            ← Back
          </button>
          <button className="btn-primary" onClick={detectHardware}>
            Retry Detection
          </button>
        </div>
      </div>
    );
  }

  if (!hardware) {
    return null;
  }

  return (
    <div className="screen-container">
      <h2>Hardware Detected</h2>
      <p className="text-gray-600 mb-6">
        Review your system specifications below
      </p>

      <div className="space-y-6">
        {/* System Info */}
        <div className="info-card">
          <h3 className="text-lg font-semibold mb-3">System Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Hostname</label>
              <p className="text-gray-900">{hardware.system.hostname}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Platform</label>
              <p className="text-gray-900">{hardware.system.platform}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Version</label>
              <p className="text-gray-900">{hardware.system.platformVersion}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Architecture</label>
              <p className="text-gray-900">{hardware.system.architecture}</p>
            </div>
          </div>
        </div>

        {/* CPU Info */}
        <div className="info-card">
          <h3 className="text-lg font-semibold mb-3">🖥️ CPU</h3>
          <p className="text-gray-900 font-medium mb-2">{hardware.cpu.model}</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <label className="text-gray-600">Cores / Threads</label>
              <p className="text-gray-900">
                {hardware.cpu.cores} / {hardware.cpu.threads}
              </p>
            </div>
            {hardware.cpu.vendor && (
              <div>
                <label className="text-gray-600">Vendor</label>
                <p className="text-gray-900">{hardware.cpu.vendor}</p>
              </div>
            )}
            {hardware.cpu.maxFrequency && (
              <div>
                <label className="text-gray-600">Max Frequency</label>
                <p className="text-gray-900">{hardware.cpu.maxFrequency}</p>
              </div>
            )}
          </div>
        </div>

        {/* RAM Info */}
        <div className="info-card">
          <h3 className="text-lg font-semibold mb-3">💾 RAM</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-gray-600">Total</label>
              <p className="text-gray-900 font-medium">{hardware.ram.totalGB} GB</p>
            </div>
            <div>
              <label className="text-gray-600">Type</label>
              <p className="text-gray-900">{hardware.ram.type}</p>
            </div>
            {hardware.ram.speed && (
              <div>
                <label className="text-gray-600">Speed</label>
                <p className="text-gray-900">{hardware.ram.speed}</p>
              </div>
            )}
          </div>
          {hardware.ram.modules.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">
                Modules ({hardware.ram.modules.length})
              </label>
              <div className="space-y-1 text-sm">
                {hardware.ram.modules.map((module, i) => (
                  <div key={i} className="flex justify-between text-gray-700">
                    <span>
                      {module.slot || `Module ${i + 1}`}: {module.size} {module.type}
                    </span>
                    {module.speed && <span>{module.speed}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* GPU Info */}
        {hardware.gpus.length > 0 && (
          <div className="info-card">
            <h3 className="text-lg font-semibold mb-3">🎮 GPU(s)</h3>
            <div className="space-y-4">
              {hardware.gpus.map((gpu, i) => (
                <div key={i} className="border-l-4 border-blue-500 pl-4">
                  <p className="text-gray-900 font-medium">{gpu.model}</p>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                    <div>
                      <label className="text-gray-600">Vendor</label>
                      <p className="text-gray-900">{gpu.vendor}</p>
                    </div>
                    <div>
                      <label className="text-gray-600">VRAM</label>
                      <p className="text-gray-900">{gpu.vram}</p>
                    </div>
                    {gpu.driver && (
                      <div>
                        <label className="text-gray-600">Driver</label>
                        <p className="text-gray-900">{gpu.driver}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Network Interfaces */}
        {hardware.networkInterfaces.filter((ni) => ni.isActive).length > 0 && (
          <div className="info-card">
            <h3 className="text-lg font-semibold mb-3">🌐 Network Interfaces</h3>
            <div className="space-y-3">
              {hardware.networkInterfaces
                .filter((ni) => ni.isActive)
                .map((ni, i) => (
                  <div key={i} className="border-l-4 border-green-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-900 font-medium">{ni.name}</p>
                        <p className="text-sm text-gray-600">{ni.type}</p>
                      </div>
                      {ni.speed && (
                        <span className="text-sm text-gray-600">{ni.speed}</span>
                      )}
                    </div>
                    <div className="mt-2 text-sm space-y-1">
                      {ni.ipv4 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">IPv4:</span>
                          <span className="text-gray-900 font-mono">{ni.ipv4}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">MAC:</span>
                        <span className="text-gray-900 font-mono">{ni.macAddress}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4 justify-between">
        <button className="btn-secondary" onClick={prevStep}>
          ← Back
        </button>
        <button className="btn-secondary" onClick={detectHardware}>
          🔄 Re-detect
        </button>
        <button className="btn-primary" onClick={handleContinue}>
          Continue to PC Type Selection →
        </button>
      </div>
    </div>
  );
};

export default HardwareDetectionScreen;
