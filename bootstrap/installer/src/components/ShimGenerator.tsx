import React, { useState } from 'react';
import { ShimConfig } from '../types/manifest';

interface ShimGeneratorProps {
  onComplete?: () => void;
}

const DEFAULT_SHIMS: Omit<ShimConfig, 'shimPath'>[] = [
  {
    name: 'Claude Flow CLI',
    targetPath: 'npx @claude-flow/cli@latest',
    arguments: [],
    environment: {},
  },
  {
    name: 'Claude Desktop',
    targetPath: 'C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\Claude\\Claude.exe',
    arguments: [],
    environment: {},
  },
  {
    name: 'Docker Compose',
    targetPath: 'docker-compose',
    arguments: [],
    environment: {},
  },
  {
    name: 'Python',
    targetPath: 'C:\\Python311\\python.exe',
    arguments: [],
    environment: {},
  },
  {
    name: 'Node.js',
    targetPath: 'C:\\Program Files\\nodejs\\node.exe',
    arguments: [],
    environment: {},
  },
];

export const ShimGenerator: React.FC<ShimGeneratorProps> = ({ onComplete }) => {
  const [shims, setShims] = useState<ShimConfig[]>(
    DEFAULT_SHIMS.map((shim) => ({
      ...shim,
      shimPath: `C:\\ProgramData\\shims\\${shim.name.toLowerCase().replace(/\s+/g, '-')}.cmd`,
    }))
  );
  const [selectedShims, setSelectedShims] = useState<Set<string>>(new Set());
  const [customShim, setCustomShim] = useState<Partial<ShimConfig>>({});
  const [showCustomForm, setShowCustomForm] = useState(false);

  const handleToggleShim = (shimName: string) => {
    setSelectedShims((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(shimName)) {
        newSet.delete(shimName);
      } else {
        newSet.add(shimName);
      }
      return newSet;
    });
  };

  const handleAddCustomShim = () => {
    if (customShim.name && customShim.targetPath) {
      const newShim: ShimConfig = {
        name: customShim.name,
        targetPath: customShim.targetPath,
        shimPath:
          customShim.shimPath ||
          `C:\\ProgramData\\shims\\${customShim.name.toLowerCase().replace(/\s+/g, '-')}.cmd`,
        arguments: customShim.arguments || [],
        environment: customShim.environment || {},
      };
      setShims([...shims, newShim]);
      setCustomShim({});
      setShowCustomForm(false);
    }
  };

  const handleGenerateShims = async () => {
    const selectedShimConfigs = shims.filter((shim) => selectedShims.has(shim.name));
    console.log('Generating shims:', selectedShimConfigs);
    // TODO: Call backend to generate shims
    if (onComplete) onComplete();
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Generate Shims</h1>
        <p className="text-gray-600">
          Create command shims for easy access to tools and executables
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-400">ℹ</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">What are shims?</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Shims are small wrapper scripts that allow you to call programs without typing the
                full path or using npx. They'll be added to your system PATH for easy access.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {shims.map((shim) => {
          const isSelected = selectedShims.has(shim.name);

          return (
            <div
              key={shim.name}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all
                ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
              `}
              onClick={() => handleToggleShim(shim.name)}
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleShim(shim.name)}
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{shim.name}</h3>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-gray-700 min-w-24">Target:</span>
                      <code className="bg-gray-200 px-2 py-0.5 rounded text-xs flex-1">
                        {shim.targetPath}
                      </code>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-gray-700 min-w-24">Shim Path:</span>
                      <code className="bg-gray-200 px-2 py-0.5 rounded text-xs flex-1">
                        {shim.shimPath}
                      </code>
                    </div>
                    {shim.arguments && shim.arguments.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-700 min-w-24">Arguments:</span>
                        <code className="bg-gray-200 px-2 py-0.5 rounded text-xs flex-1">
                          {shim.arguments.join(' ')}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!showCustomForm ? (
        <button
          onClick={() => setShowCustomForm(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors mb-6"
        >
          + Add Custom Shim
        </button>
      ) : (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add Custom Shim</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shim Name</label>
              <input
                type="text"
                value={customShim.name || ''}
                onChange={(e) => setCustomShim({ ...customShim, name: e.target.value })}
                placeholder="My Custom Tool"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Path</label>
              <input
                type="text"
                value={customShim.targetPath || ''}
                onChange={(e) => setCustomShim({ ...customShim, targetPath: e.target.value })}
                placeholder="C:\Program Files\MyTool\mytool.exe"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shim Path (optional)
              </label>
              <input
                type="text"
                value={customShim.shimPath || ''}
                onChange={(e) => setCustomShim({ ...customShim, shimPath: e.target.value })}
                placeholder="C:\ProgramData\shims\mytool.cmd"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to auto-generate based on shim name
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddCustomShim}
                disabled={!customShim.name || !customShim.targetPath}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Shim
              </button>
              <button
                onClick={() => {
                  setShowCustomForm(false);
                  setCustomShim({});
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-400">⚠</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Administrator Required</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Generating shims requires administrator privileges. You may be prompted to elevate
                permissions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4 justify-center">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleGenerateShims}
          disabled={selectedShims.size === 0}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate {selectedShims.size} Shim{selectedShims.size !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
};
