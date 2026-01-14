import React, { useEffect, useState } from 'react';
import { ComponentId } from '../types/manifest';
import { useInstallStore } from '../store/installStore';
import manifestData from '../data/manifest.json';

interface ComponentInfo {
  id: ComponentId;
  displayName: string;
  description: string;
  enabled: boolean;
  required?: boolean;
}

export const ComponentSelector: React.FC = () => {
  const { selectedPC, enabledComponents, toggleComponent } = useInstallStore();
  const [components, setComponents] = useState<ComponentInfo[]>([]);

  useEffect(() => {
    if (!selectedPC) return;

    const deployment = manifestData.deployments[selectedPC];
    if (!deployment) return;

    const componentList: ComponentInfo[] = Object.entries(
      deployment.components
    ).map(([id, component]: [string, any]) => ({
      id: id as ComponentId,
      displayName: component.displayName,
      description: component.description,
      enabled: component.enabled,
      required: id === 'claude-code' || id === 'docker', // Core components
    }));

    setComponents(componentList);

    // Pre-select enabled components
    componentList.forEach((comp) => {
      if (comp.enabled && !enabledComponents.has(comp.id)) {
        toggleComponent(comp.id);
      }
    });
  }, [selectedPC]);

  if (!selectedPC) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-500">Please select a PC first</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Select Components</h1>
        <p className="text-gray-600">
          Choose which components to install on {selectedPC}
        </p>
      </div>

      <div className="space-y-3">
        {components.map((component) => {
          const isEnabled = enabledComponents.has(component.id);
          const isRequired = component.required;

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
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">
                      {component.displayName}
                    </h3>
                    {isRequired && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                        Required
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
            // TODO: Go back to PC selection
            console.log('Go back');
          }}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => {
            // TODO: Start installation
            console.log('Start installation');
          }}
          disabled={enabledComponents.size === 0}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Installation
        </button>
      </div>
    </div>
  );
};
