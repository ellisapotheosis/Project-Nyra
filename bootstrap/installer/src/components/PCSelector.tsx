import React from 'react';
import { PCId } from '../types/manifest';
import { useInstallStore } from '../store/installStore';

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
  const { selectedPC, selectPC } = useInstallStore();

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Select Your PC</h1>
        <p className="text-gray-600">
          Choose which PC you want to bootstrap from the 4-PC cluster
        </p>
      </div>

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

      {selectedPC && (
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              // TODO: Move to next phase
              console.log('Selected PC:', selectedPC);
            }}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Continue to Component Selection
          </button>
        </div>
      )}
    </div>
  );
};
