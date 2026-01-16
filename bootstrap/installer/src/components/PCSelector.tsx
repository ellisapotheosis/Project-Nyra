import React, { useEffect, useState } from 'react';
import { PCId } from '../types/manifest';
import { useInstallStore } from '../store/installStore';
import { PCDetector, PCDetectionResult } from '../services/pcDetector';

interface PCSpec {
  id: PCId;
  name: string;
  role: string;
  cpu: string;
  gpu?: string;
  ram: string;
  features: string[];
}

const PC_SPECS: PCSpec[] = [
  {
    id: 'orchestrator-mini',
    name: 'Orchestrator Mini PC',
    role: 'orchestrator',
    cpu: 'Ryzen 7 6800H',
    ram: '16GB DDR5',
    features: ['WSL Required', '24/7 Always-On', 'Docker Host', 'Gitea Server'],
  },
  {
    id: 'worker-rtx3090ti',
    name: 'Worker RTX 3090 Ti',
    role: 'worker',
    cpu: 'Intel i7 12700',
    gpu: 'RTX 3090 Ti',
    ram: '32GB',
    features: ['GPU Compute', 'Always-On', 'NVIDIA Container Toolkit'],
  },
  {
    id: 'worker-rtx5090',
    name: 'Worker RTX 5090',
    role: 'worker',
    cpu: 'Alienware Area-51',
    gpu: 'RTX 5090',
    ram: '32GB',
    features: ['GPU Compute', 'Mobile/Disconnectable', 'Wake-on-LAN'],
  },
  {
    id: 'worker-rtx3060',
    name: 'Worker RTX 3060',
    role: 'worker',
    cpu: 'Alienware M15R7',
    gpu: 'RTX 3060',
    ram: '32GB',
    features: ['GPU Compute', 'Mobile/Disconnectable', 'Wake-on-LAN'],
  },
];

export const PCSelector: React.FC = () => {
  const {
    selectedPC,
    selectPC,
    setPhase,
    detectionResult,
    setDetectionResult,
    setAutoDetected,
    isAutoDetected
  } = useInstallStore();

  const [isDetecting, setIsDetecting] = useState(false);
  const [showManualSelection, setShowManualSelection] = useState(false);

  useEffect(() => {
    // Auto-detect on mount
    const runDetection = async () => {
      setIsDetecting(true);
      try {
        const result = await PCDetector.detect();
        setDetectionResult(result);
        selectPC(result.detectedPC);
        setAutoDetected(true);
      } catch (error) {
        console.error('Detection failed:', error);
        // Fall back to manual selection on error
        setShowManualSelection(true);
      } finally {
        setIsDetecting(false);
      }
    };

    runDetection();
  }, []);

  const handleManualOverride = () => {
    setShowManualSelection(true);
    setAutoDetected(false);
  };

  const formatRAM = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(0)}GB`;
  };

  if (isDetecting) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Detecting PC Configuration...</h2>
          <p className="text-gray-600">
            Analyzing hardware (CPU, GPU, RAM, Network)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PC Role Selection</h1>
        <p className="text-gray-600">
          {isAutoDetected && !showManualSelection
            ? 'Auto-detected PC configuration'
            : 'Choose which PC you want to bootstrap from the 4-PC cluster'}
        </p>
      </div>

      {/* Detection Result Card */}
      {detectionResult && !showManualSelection && (
        <div className="mb-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
                ✓
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900">
                  Detected: {PC_SPECS.find(p => p.id === detectionResult.detectedPC)?.name}
                </h3>
                <p className="text-sm text-green-700">
                  {detectionResult.role.toUpperCase()} • Confidence: {detectionResult.confidence}%
                </p>
              </div>
            </div>
            <button
              onClick={handleManualOverride}
              className="px-4 py-2 text-sm border-2 border-green-500 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              Change
            </button>
          </div>

          {/* Detected Specs */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-3 rounded">
              <p className="text-xs text-gray-500 mb-1">HOSTNAME</p>
              <p className="font-semibold">{detectionResult.specs.hostname}</p>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="text-xs text-gray-500 mb-1">CPU</p>
              <p className="font-semibold text-sm">{detectionResult.specs.cpu}</p>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="text-xs text-gray-500 mb-1">RAM</p>
              <p className="font-semibold">{formatRAM(detectionResult.specs.totalMemory)}</p>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="text-xs text-gray-500 mb-1">GPU</p>
              <p className="font-semibold text-sm">
                {detectionResult.specs.gpus.length > 0
                  ? detectionResult.specs.gpus.map(g => g.name).join(', ')
                  : 'No GPU Detected'}
              </p>
            </div>
          </div>

          {/* Network Info */}
          {detectionResult.specs.networkInterfaces.length > 0 && (
            <div className="bg-white p-3 rounded mb-4">
              <p className="text-xs text-gray-500 mb-2">NETWORK INTERFACES</p>
              {detectionResult.specs.networkInterfaces.map((iface, idx) => (
                <div key={idx} className="text-sm mb-1">
                  <span className="font-medium">{iface.name}:</span> {iface.address}
                  {iface.isStatic && (
                    <span className="ml-2 px-1 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                      Static
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Docker Host Badge */}
          {detectionResult.specs.isDockerHost && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded">
                Docker Host Detected
              </span>
            </div>
          )}
        </div>
      )}

      {/* Manual Selection Grid */}
      {showManualSelection && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PC_SPECS.map((pc) => (
            <button
              key={pc.id}
              onClick={() => selectPC(pc.id)}
              className={`
                p-6 rounded-lg border-2 transition-all text-left
                ${
                  selectedPC === pc.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold">{pc.name}</h3>
                  <span className="text-sm text-gray-500 uppercase">
                    {pc.role}
                  </span>
                </div>
                <div
                  className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${selectedPC === pc.id ? 'border-blue-500' : 'border-gray-300'}
                  `}
                >
                  {selectedPC === pc.id && (
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-sm">
                  <span className="font-medium">CPU:</span> {pc.cpu}
                </div>
                {pc.gpu && (
                  <div className="text-sm">
                    <span className="font-medium">GPU:</span> {pc.gpu}
                  </div>
                )}
                <div className="text-sm">
                  <span className="font-medium">RAM:</span> {pc.ram}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {pc.features.map((feature) => (
                  <span
                    key={feature}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedPC && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setPhase('environment')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Continue to Environment Selection
          </button>
        </div>
      )}
    </div>
  );
};
