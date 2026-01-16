import React from 'react';
import { useInstallStore } from './store/installStore';
import { PCSelector } from './components/PCSelector';
import { ComponentSelector } from './components/ComponentSelector';
import { InstallationProgress } from './components/InstallationProgress';
import { EnvironmentSelector } from './components/EnvironmentSelector';
import { MCPServerManager } from './components/MCPServerManager';
import { DockerSetup } from './components/DockerSetup';
import { CloudflareTunnelSetup } from './components/CloudflareTunnelSetup';
import { ConfigurationEditor } from './components/ConfigurationEditor';
import { ShimGenerator } from './components/ShimGenerator';
import { HealthDashboard } from './components/HealthDashboard';

function App() {
  const { currentPhase, setPhase } = useInstallStore();

  // Phase navigation helpers
  const goToNextPhase = () => {
    const phaseOrder: typeof currentPhase[] = [
      'selection',
      'environment',
      'components',
      'mcp-servers',
      'docker',
      'cloudflare-tunnels',
      'configuration',
      'shims',
      'deployment',
      'health-check',
      'complete',
    ];
    const currentIndex = phaseOrder.indexOf(currentPhase);
    if (currentIndex < phaseOrder.length - 1) {
      setPhase(phaseOrder[currentIndex + 1]);
    }
  };

  const renderPhase = () => {
    switch (currentPhase) {
      case 'selection':
        return <PCSelector />;
      case 'environment':
        return <EnvironmentSelector />;
      case 'components':
        return <ComponentSelector />;
      case 'mcp-servers':
        return <MCPServerManager onComplete={goToNextPhase} />;
      case 'docker':
        return <DockerSetup onComplete={goToNextPhase} />;
      case 'cloudflare-tunnels':
        return <CloudflareTunnelSetup onComplete={goToNextPhase} />;
      case 'configuration':
        return <ConfigurationEditor onComplete={goToNextPhase} />;
      case 'shims':
        return <ShimGenerator onComplete={goToNextPhase} />;
      case 'deployment':
        return <InstallationProgress />;
      case 'health-check':
        return <HealthDashboard onComplete={goToNextPhase} />;
      case 'complete':
        return (
          <div className="w-full max-w-4xl mx-auto p-6 text-center">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-12">
              <div className="text-6xl mb-4">✓</div>
              <h1 className="text-3xl font-bold text-green-900 mb-2">
                Installation Complete!
              </h1>
              <p className="text-green-700 mb-6">
                Your Project Nyra environment has been successfully configured.
              </p>
              <button
                onClick={() => setPhase('selection')}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Install Another PC
              </button>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="w-full max-w-4xl mx-auto p-6 text-center">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-12">
              <div className="text-6xl mb-4">✗</div>
              <h1 className="text-3xl font-bold text-red-900 mb-2">
                Installation Failed
              </h1>
              <p className="text-red-700 mb-6">
                An error occurred during installation. Please check the logs.
              </p>
              <button
                onClick={() => setPhase('selection')}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        );
      default:
        return <PCSelector />;
    }
  };

  // Progress indicator
  const phaseProgress: Record<typeof currentPhase, number> = {
    selection: 0,
    environment: 10,
    components: 20,
    'mcp-servers': 30,
    docker: 45,
    'cloudflare-tunnels': 55,
    configuration: 65,
    shims: 75,
    deployment: 85,
    'health-check': 95,
    complete: 100,
    error: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Project Nyra Bootstrap Installer
          </h1>
          <p className="text-sm text-gray-600">
            Complete Bootstrap Configuration with Docker, MCP, and Environment Setup
          </p>
        </div>

        {/* Progress Bar */}
        {currentPhase !== 'error' && currentPhase !== 'complete' && (
          <div className="max-w-7xl mx-auto px-6 pb-3">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${phaseProgress[currentPhase]}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-600 min-w-12">
                {phaseProgress[currentPhase]}%
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="py-8">{renderPhase()}</main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-white border-t border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          Project Nyra Bootstrap v2.0.0 | Enhanced Configuration System
        </div>
      </footer>
    </div>
  );
}

export default App;
