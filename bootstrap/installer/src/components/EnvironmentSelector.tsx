import React, { useState } from 'react';
import { EnvironmentType } from '../types/manifest';
import { useInstallStore } from '../store/installStore';

interface EnvironmentOption {
  type: EnvironmentType;
  displayName: string;
  description: string;
  icon: string;
  features: string[];
}

const ENVIRONMENTS: EnvironmentOption[] = [
  {
    type: 'development',
    displayName: 'Development',
    description: 'Local development environment with hot reload and debugging',
    icon: '🔧',
    features: ['Hot Reload', 'Debug Mode', 'Mock Services', 'Local Storage'],
  },
  {
    type: 'production',
    displayName: 'Production',
    description: 'Production environment with optimizations and security',
    icon: '🚀',
    features: ['Optimized Build', 'SSL/TLS', 'Load Balancing', 'Monitoring'],
  },
  {
    type: 'pc1',
    displayName: 'PC1 - Orchestrator',
    description: 'Mini PC orchestrator node',
    icon: '🎯',
    features: ['Claude Flow', 'Coordination', 'Infisical', 'Gitea'],
  },
  {
    type: 'pc2',
    displayName: 'PC2 - RTX 3090 Ti',
    description: 'High-performance GPU worker',
    icon: '⚡',
    features: ['GPU Compute', 'ML Training', 'Docker', 'NVIDIA Runtime'],
  },
  {
    type: 'pc3',
    displayName: 'PC3 - RTX 3060',
    description: 'Mid-tier GPU worker',
    icon: '💪',
    features: ['GPU Compute', 'Docker', 'NVIDIA Runtime'],
  },
  {
    type: 'pc4',
    displayName: 'PC4 - RTX 5090',
    description: 'Ultra high-performance GPU worker',
    icon: '🔥',
    features: ['GPU Compute', 'ML Training', 'Docker', 'NVIDIA Runtime'],
  },
];

export const EnvironmentSelector: React.FC = () => {
  const { selectedEnvironment, selectEnvironment, setPhase } = useInstallStore();
  const [localSelection, setLocalSelection] = useState<EnvironmentType | null>(
    selectedEnvironment
  );

  const handleSelect = (env: EnvironmentType) => {
    setLocalSelection(env);
    selectEnvironment(env);
  };

  const handleContinue = () => {
    if (localSelection) {
      setPhase('components');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Select Environment</h1>
        <p className="text-gray-600">
          Choose your deployment environment or target PC
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {ENVIRONMENTS.map((env) => {
          const isSelected = localSelection === env.type;

          return (
            <div
              key={env.type}
              className={`
                p-6 rounded-lg border-2 cursor-pointer transition-all
                ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
              `}
              onClick={() => handleSelect(env.type)}
            >
              <div className="text-4xl mb-3">{env.icon}</div>

              <h3 className="text-xl font-semibold mb-2">{env.displayName}</h3>

              <p className="text-sm text-gray-600 mb-4">{env.description}</p>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-700 uppercase">
                  Features
                </p>
                <ul className="space-y-1">
                  {env.features.map((feature) => (
                    <li key={feature} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={handleContinue}
          disabled={!localSelection}
          className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
