import React, { useState, useEffect } from 'react';
import { BootstrapConfig } from '../App';
import { PCId, PCRole } from '../types/manifest';

interface Props {
  config: BootstrapConfig;
  updateConfig: (updates: Partial<BootstrapConfig>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

interface PCDetectionResult {
  detectedPC: PCId;
  confidence: number;
  role: PCRole;
  alternativePCs?: PCId[];
  recommendedComponents: string[];
  skipComponents: string[];
}

const PC_DISPLAY_NAMES: Record<PCId, string> = {
  'orchestrator-mini': '🎮 Orchestrator Mini PC',
  'worker-rtx3090ti': '💪 Worker - RTX 3090 Ti',
  'worker-rtx5090': '🚀 Worker - RTX 5090',
  'worker-rtx3060': '💻 Worker - RTX 3060 Laptop',
};

const PC_DESCRIPTIONS: Record<PCId, string> = {
  'orchestrator-mini':
    'Minisforum UH680 - Ryzen 7 6800H, 16GB RAM. Manages all services, databases, and coordinates workers.',
  'worker-rtx3090ti':
    'Desktop workstation with RTX 3090 Ti (24GB VRAM). Runs Ollama models and heavy GPU workloads.',
  'worker-rtx5090':
    'High-performance desktop with RTX 5090 (24GB VRAM). Runs latest Ollama models with maximum performance.',
  'worker-rtx3060':
    'Alienware M15 R7 laptop with RTX 3060 (12GB VRAM), 32GB RAM. Portable AI workstation.',
};

const PCTypeConfirmationScreen: React.FC<Props> = ({
  config,
  updateConfig,
  nextStep,
  prevStep,
}) => {
  const [detecting, setDetecting] = useState(true);
  const [detection, setDetection] = useState<PCDetectionResult | null>(null);
  const [selectedPC, setSelectedPC] = useState<PCId | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    detectPCType();
  }, []);

  const detectPCType = async () => {
    setDetecting(true);
    setError(null);

    try {
      // Call electron IPC to detect PC type
      const result = await window.bootstrap.detectPCType();
      setDetection(result);
      setSelectedPC(result.detectedPC);
    } catch (err: any) {
      setError(err.message || 'Failed to detect PC type');
    } finally {
      setDetecting(false);
    }
  };

  const handleContinue = () => {
    if (selectedPC) {
      updateConfig({
        selectedPC,
        pcRole: detection?.role || (selectedPC === 'orchestrator-mini' ? 'orchestrator' : 'worker'),
      });
      nextStep();
    }
  };

  if (detecting) {
    return (
      <div className="screen-container">
        <h2>Detecting PC Type</h2>
        <div className="text-center py-12">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">
            Analyzing your hardware to determine the optimal PC configuration...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="screen-container">
        <h2>PC Type Detection Failed</h2>
        <div className="error-box">
          <h3>⚠️ Detection Error</h3>
          <p>{error}</p>
        </div>
        <div className="button-group">
          <button className="btn-secondary" onClick={prevStep}>
            ← Back
          </button>
          <button className="btn-primary" onClick={detectPCType}>
            Retry Detection
          </button>
        </div>
      </div>
    );
  }

  if (!detection) {
    return null;
  }

  const allPCTypes: PCId[] = [
    'orchestrator-mini',
    'worker-rtx5090',
    'worker-rtx3090ti',
    'worker-rtx3060',
  ];

  return (
    <div className="screen-container">
      <h2>Confirm PC Type</h2>
      <p className="text-gray-600 mb-6">
        We've detected your PC type based on hardware. Please confirm or select a different type.
      </p>

      {/* Detection Result */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Detected: {PC_DISPLAY_NAMES[detection.detectedPC]}
            </h3>
            <p className="text-blue-700 mb-3">{PC_DESCRIPTIONS[detection.detectedPC]}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-900">
                Confidence:
              </span>
              <div className="flex-1 max-w-xs">
                <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${detection.confidence}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-blue-900">
                {detection.confidence}%
              </span>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">Role</div>
            <div className="text-sm font-semibold text-gray-900 uppercase">
              {detection.role}
            </div>
          </div>
        </div>

        {detection.alternativePCs && detection.alternativePCs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Alternative matches:</strong>{' '}
              {detection.alternativePCs.map((pc) => PC_DISPLAY_NAMES[pc]).join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* PC Type Selection */}
      <div className="space-y-3 mb-6">
        <h3 className="text-lg font-semibold mb-3">Select PC Type:</h3>
        {allPCTypes.map((pcType) => {
          const isDetected = pcType === detection.detectedPC;
          const isSelected = pcType === selectedPC;

          return (
            <div
              key={pcType}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all
                ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                ${isDetected ? 'ring-2 ring-blue-300' : ''}
              `}
              onClick={() => setSelectedPC(pcType)}
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center h-6">
                  <input
                    type="radio"
                    checked={isSelected}
                    onChange={() => setSelectedPC(pcType)}
                    className="w-5 h-5"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base font-semibold">
                      {PC_DISPLAY_NAMES[pcType]}
                    </h4>
                    {isDetected && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                        Detected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{PC_DESCRIPTIONS[pcType]}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* What Will Be Installed */}
      {selectedPC && (
        <div className="info-card mb-6">
          <h3 className="text-lg font-semibold mb-3">
            Components for {PC_DISPLAY_NAMES[selectedPC]}
          </h3>

          <div className="grid grid-cols-2 gap-6">
            {detection.recommendedComponents.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-700 mb-2">
                  ✓ Will Install:
                </h4>
                <ul className="text-sm space-y-1">
                  {detection.recommendedComponents.map((comp, i) => (
                    <li key={i} className="text-gray-700">• {comp}</li>
                  ))}
                </ul>
              </div>
            )}

            {detection.skipComponents.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  ⊗ Will Skip:
                </h4>
                <ul className="text-sm space-y-1">
                  {detection.skipComponents.map((comp, i) => (
                    <li key={i} className="text-gray-500">• {comp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 justify-between">
        <button className="btn-secondary" onClick={prevStep}>
          ← Back
        </button>
        <button className="btn-secondary" onClick={detectPCType}>
          🔄 Re-detect
        </button>
        <button
          className="btn-primary"
          onClick={handleContinue}
          disabled={!selectedPC}
        >
          Continue to Prerequisites →
        </button>
      </div>
    </div>
  );
};

export default PCTypeConfirmationScreen;
