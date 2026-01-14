import React from 'react';
import { useInstallStore } from './store/installStore';
import { PCSelector } from './components/PCSelector';
import { ComponentSelector } from './components/ComponentSelector';
import { InstallationProgress } from './components/InstallationProgress';

function App() {
  const { currentPhase } = useInstallStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Project Nyra Bootstrap Installer
          </h1>
          <p className="text-sm text-gray-600">
            4-PC Windows 11 Cluster Configuration
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        {currentPhase === 'selection' && <PCSelector />}
        {currentPhase === 'selection' && <ComponentSelector />}
        {['windows', 'wsl', 'deployment', 'validation', 'complete', 'error'].includes(
          currentPhase
        ) && <InstallationProgress />}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-white border-t border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          Project Nyra Bootstrap v1.0.0 | Windows 11 + WSL Configuration
        </div>
      </footer>
    </div>
  );
}

export default App;
