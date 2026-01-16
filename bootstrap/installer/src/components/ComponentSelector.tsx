import React, { useEffect, useState } from 'react';
import { ComponentId } from '../types/manifest';
import { useInstallStore } from '../store/installStore';
import { useInstallation } from '../hooks/useInstallation';
import manifestData from '../data/manifest.json';

interface ComponentInfo {
  id: ComponentId;
  displayName: string;
  description: string;
  enabled: boolean;
  required?: boolean;
  recommended?: boolean;
  skipReason?: string;
}

export const ComponentSelector: React.FC = () => {
  const {
    selectedPC,
    enabledComponents,
    toggleComponent,
    setPhase,
    detectionResult,
    isAutoDetected
  } = useInstallStore();
  const { startInstallation } = useInstallation();
  const [components, setComponents] = useState<ComponentInfo[]>([]);

  useEffect(() => {
    if (!selectedPC) return;

    const deployment = manifestData.deployments[selectedPC];
    if (!deployment) return;

    // Get skip list from detection if available
    const skipComponents = detectionResult?.skipComponents || [];
    const recommendedComponents = detectionResult?.recommendedComponents || [];

    const componentList: ComponentInfo[] = Object.entries(
      deployment.components
    ).map(([id, component]: [string, any]) => {
      const componentId = id as ComponentId;
      const isSkipped = skipComponents.includes(componentId);
      const isRecommended = recommendedComponents.includes(componentId);
      const isRequired = componentId === 'claude-code' || componentId === 'docker';

      return {
        id: componentId,
        displayName: component.displayName,
        description: component.description,
        enabled: !isSkipped && (component.enabled || isRecommended),
        required: isRequired,
        recommended: isRecommended,
        skipReason: isSkipped ? getSkipReason(componentId, detectionResult?.role) : undefined,
      };
    }).filter(comp => !skipComponents.includes(comp.id)); // Filter out skipped components

    setComponents(componentList);

    // Pre-select enabled and recommended components
    componentList.forEach((comp) => {
      if ((comp.enabled || comp.recommended) && !enabledComponents.has(comp.id)) {
        toggleComponent(comp.id);
      }
    });
  }, [selectedPC, detectionResult]);

  const getSkipReason = (componentId: ComponentId, role?: string) => {
    if (role === 'worker') {
      if (componentId === 'wsl-setup') return 'WSL not needed on GPU workers';
      if (componentId === 'gitea') return 'Gitea only runs on orchestrator';
      if (componentId === 'claude-desktop') return 'Desktop app only on orchestrator';
      if (componentId === 'infisical') return 'Secrets management on orchestrator only';
    } else if (role === 'orchestrator') {
      if (componentId === 'nvidia') return 'No GPU detected on orchestrator';
    }
    return 'Not applicable for this PC role';
  };

  if (!selectedPC) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-500">Please select a PC first</p>
      </div>
    );
  }

  const formatRAM = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(0)}GB`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Select Components</h1>
        <p className="text-gray-600">
          Choose which components to install on {selectedPC}
        </p>
      </div>

      {/* Detection Summary Card */}
      {detectionResult && isAutoDetected && (
        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Detected Hardware</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-blue-600 font-medium">CPU:</span>
                  <p className="text-blue-800 truncate" title={detectionResult.specs.cpu}>
                    {detectionResult.specs.cpu.substring(0, 20)}...
                  </p>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">RAM:</span>
                  <p className="text-blue-800">{formatRAM(detectionResult.specs.totalMemory)}</p>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">GPU:</span>
                  <p className="text-blue-800">
                    {detectionResult.specs.gpus.filter(g => g.detected).length > 0
                      ? detectionResult.specs.gpus[0].name.substring(0, 15)
                      : 'None'}
                  </p>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Role:</span>
                  <p className="text-blue-800 uppercase font-semibold">{detectionResult.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {components.map((component) => {
          const isEnabled = enabledComponents.has(component.id);
          const isRequired = component.required;
          const isRecommended = component.recommended;

          return (
            <div
              key={component.id}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${isEnabled ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                ${isRequired ? 'opacity-75' : 'cursor-pointer hover:border-gray-300'}
              `}
              onClick={() => {
                if (!isRequired) {
                  toggleComponent(component.id);
                }
              }}
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    disabled={isRequired}
                    onChange={() => {
                      if (!isRequired) {
                        toggleComponent(component.id);
                      }
                    }}
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-lg font-semibold">
                      {component.displayName}
                    </h3>
                    {isRequired && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                        Required
                      </span>
                    )}
                    {isRecommended && !isRequired && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {component.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex gap-4 justify-center">
        <button
          onClick={() => {
            setPhase('environment');
          }}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => setPhase('mcp-servers')}
          disabled={enabledComponents.size === 0}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to MCP Configuration
        </button>
      </div>
    </div>
  );
};
