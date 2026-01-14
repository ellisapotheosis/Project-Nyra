import React from 'react';
import { useInstallStore } from '../store/installStore';

export const InstallationProgress: React.FC = () => {
  const { currentPhase, progress, logs, isInstalling } = useInstallStore();

  const phaseLabels: Record<string, string> = {
    selection: 'Selection',
    windows: 'Windows Bootstrap',
    wsl: 'WSL Bootstrap',
    deployment: 'File Deployment',
    validation: 'Validation',
    complete: 'Complete',
    error: 'Error',
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Installation Progress</h1>
        <p className="text-gray-600">
          Current Phase: {phaseLabels[currentPhase]}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Phase Indicators */}
      <div className="flex justify-between mb-8">
        {['selection', 'windows', 'wsl', 'deployment', 'validation', 'complete'].map(
          (phase, index) => {
            const isCurrent = currentPhase === phase;
            const isPast = ['selection', 'windows', 'wsl', 'deployment', 'validation', 'complete'].indexOf(currentPhase) >
              ['selection', 'windows', 'wsl', 'deployment', 'validation', 'complete'].indexOf(phase);

            return (
              <div key={phase} className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center mb-2
                    ${isPast ? 'bg-green-500 text-white' : ''}
                    ${isCurrent ? 'bg-blue-500 text-white' : ''}
                    ${!isPast && !isCurrent ? 'bg-gray-200 text-gray-500' : ''}
                  `}
                >
                  {isPast ? '✓' : index + 1}
                </div>
                <span className="text-xs text-center">{phaseLabels[phase]}</span>
              </div>
            );
          }
        )}
      </div>

      {/* Log Output */}
      <div className="bg-gray-900 text-gray-100 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            Waiting for installation to start...
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`
                mb-1
                ${log.level === 'error' ? 'text-red-400' : ''}
                ${log.level === 'warn' ? 'text-yellow-400' : ''}
                ${log.level === 'success' ? 'text-green-400' : ''}
              `}
            >
              <span className="text-gray-500">
                [{log.timestamp.toLocaleTimeString()}]
              </span>{' '}
              {log.component && (
                <span className="text-blue-400">[{log.component}]</span>
              )}{' '}
              {log.message}
              {log.details && (
                <div className="ml-4 text-gray-400">{log.details}</div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-4 justify-center">
        {isInstalling ? (
          <button
            disabled
            className="px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed"
          >
            Installing...
          </button>
        ) : currentPhase === 'complete' ? (
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Install Another PC
          </button>
        ) : currentPhase === 'error' ? (
          <>
            <button
              onClick={() => {
                // TODO: Implement rollback
                console.log('Rollback');
              }}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Rollback
            </button>
            <button
              onClick={() => {
                // TODO: Retry installation
                console.log('Retry');
              }}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};
