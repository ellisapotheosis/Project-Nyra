import React, { useState, useEffect } from 'react';
import { createTailscaleService, TailscaleConfig, NetworkInfo, TailscaleStatus } from '../services/tailscaleService';

interface TailscaleSetupProps {
  nodeType: 'orchestrator' | 'worker';
  hostname: string;
  onComplete: (success: boolean, nodeInfo?: any) => void;
  onProgress?: (message: string) => void;
  authKey?: string;
}

export const TailscaleSetup: React.FC<TailscaleSetupProps> = ({
  nodeType,
  hostname,
  onComplete,
  onProgress,
  authKey: providedAuthKey,
}) => {
  const [status, setStatus] = useState<'idle' | 'detecting' | 'installing' | 'configuring' | 'verifying' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [tailscaleStatus, setTailscaleStatus] = useState<TailscaleStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authKey, setAuthKey] = useState(providedAuthKey || '');
  const [skipTailscale, setSkipTailscale] = useState(false);

  const updateProgress = (step: string, percent: number) => {
    setCurrentStep(step);
    setProgress(percent);
    onProgress?.(step);
  };

  const setupTailscale = async () => {
    if (!authKey) {
      setError('Auth key is required');
      return;
    }

    try {
      setStatus('detecting');
      updateProgress('Detecting network configuration...', 10);

      // Create Tailscale service config
      const config: TailscaleConfig = {
        authKey,
        hostname: `${hostname}-tailscale`,
        nodeType,
        exitNode: nodeType === 'orchestrator',
        advertiseRoutes: nodeType === 'orchestrator' ? ['10.0.0.0/24'] : undefined,
        acceptRoutes: true,
        acceptDns: true,
        enableSsh: true,
      };

      const service = createTailscaleService(config);

      // Detect network info
      const netInfo = await service.detectNetworkInfo();
      setNetworkInfo(netInfo);
      updateProgress(`Network detected: ${netInfo.ipAddress}`, 20);

      // Check if installed
      setStatus('installing');
      const isInstalled = await service.isInstalled();

      if (!isInstalled) {
        updateProgress('Installing Tailscale...', 30);
        await service.install((msg) => updateProgress(msg, 40));
      } else {
        updateProgress('Tailscale already installed', 40);
      }

      // Configure Tailscale
      setStatus('configuring');
      updateProgress('Configuring Tailscale mesh...', 50);

      const tsStatus = await service.configure((msg) => updateProgress(msg, 60));
      setTailscaleStatus(tsStatus);
      updateProgress('Tailscale connected', 70);

      // Configure firewall
      updateProgress('Configuring firewall...', 75);
      await service.configureFirewall();

      // Enable auto-start
      updateProgress('Enabling auto-start...', 80);
      await service.enableAutoStart();

      // Store node information
      setStatus('verifying');
      updateProgress('Storing node information...', 85);

      const nodeInfo = await service.storeNodeInfo(netInfo, tsStatus);
      updateProgress('Node information stored', 90);

      // Verify connection
      updateProgress('Verifying connection...', 95);
      const connected = await service.getStatus();

      if (!connected.connected) {
        throw new Error('Failed to verify Tailscale connection');
      }

      setStatus('complete');
      updateProgress('Tailscale setup complete!', 100);

      // Show exit node instructions for orchestrator
      if (nodeType === 'orchestrator') {
        onProgress?.('IMPORTANT: Approve exit node and subnet routes in Tailscale admin console');
      }

      onComplete(true, nodeInfo);
    } catch (err) {
      setStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onProgress?.(`Error: ${errorMessage}`);
      onComplete(false);
    }
  };

  const handleSkip = () => {
    setSkipTailscale(true);
    onComplete(true, { skipped: true });
  };

  const handleRetry = () => {
    setError(null);
    setStatus('idle');
    setProgress(0);
    setupTailscale();
  };

  useEffect(() => {
    if (status === 'idle' && authKey && !skipTailscale) {
      setupTailscale();
    }
  }, [status, authKey, skipTailscale]);

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Tailscale Mesh Network Setup</h2>
        <p className="text-gray-600">
          {nodeType === 'orchestrator'
            ? 'Configuring orchestrator as exit node with subnet routing'
            : 'Configuring worker node in mesh network'}
        </p>
      </div>

      {/* Network Info Display */}
      {networkInfo && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Detected Network Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Interface:</span> {networkInfo.interfaceName}
            </div>
            <div>
              <span className="font-medium">IP Address:</span> {networkInfo.ipAddress}
            </div>
            <div>
              <span className="font-medium">MAC Address:</span> {networkInfo.macAddress}
            </div>
          </div>
        </div>
      )}

      {/* Tailscale Status Display */}
      {tailscaleStatus && tailscaleStatus.connected && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold mb-2">Tailscale Connection</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Status:</span>{' '}
              <span className="text-green-600">Connected</span>
            </div>
            <div>
              <span className="font-medium">Hostname:</span> {tailscaleStatus.hostname || hostname}
            </div>
            {tailscaleStatus.ipv4 && (
              <div>
                <span className="font-medium">Tailscale IP:</span> {tailscaleStatus.ipv4}
              </div>
            )}
            {nodeType === 'orchestrator' && (
              <div>
                <span className="font-medium">Exit Node:</span>{' '}
                <span className="text-blue-600">Enabled (Pending Approval)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>{currentStep || 'Ready to start...'}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              status === 'error' ? 'bg-red-500' : status === 'complete' ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-4 h-4 rounded-full ${
              status === 'complete'
                ? 'bg-green-500'
                : status === 'error'
                ? 'bg-red-500'
                : status === 'idle'
                ? 'bg-gray-300'
                : 'bg-blue-500 animate-pulse'
            }`}
          />
          <span className="font-medium">
            {status === 'idle' && 'Ready to start'}
            {status === 'detecting' && 'Detecting network...'}
            {status === 'installing' && 'Installing Tailscale...'}
            {status === 'configuring' && 'Configuring mesh...'}
            {status === 'verifying' && 'Verifying connection...'}
            {status === 'complete' && 'Setup complete!'}
            {status === 'error' && 'Error occurred'}
          </span>
        </div>
      </div>

      {/* Auth Key Input */}
      {!providedAuthKey && status === 'idle' && !skipTailscale && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Tailscale Auth Key</label>
          <input
            type="password"
            value={authKey}
            onChange={(e) => setAuthKey(e.target.value)}
            placeholder="tskey-auth-xxxxxxxxxxxxx"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Generate at:{' '}
            <a
              href="https://login.tailscale.com/admin/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Tailscale Admin Console
            </a>
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">Setup Failed</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Exit Node Instructions */}
      {status === 'complete' && nodeType === 'orchestrator' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Action Required</h3>
          <p className="text-yellow-700 text-sm mb-2">
            Please approve the exit node and subnet routes in the Tailscale admin console:
          </p>
          <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
            <li>Visit the Tailscale admin console</li>
            <li>Find the machine: {hostname}-tailscale</li>
            <li>Edit route settings</li>
            <li>Enable "Use as exit node"</li>
            <li>Approve subnet routes: 10.0.0.0/24</li>
          </ol>
          <a
            href="https://login.tailscale.com/admin/machines"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          >
            Open Admin Console
          </a>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        {status === 'idle' && !skipTailscale && (
          <>
            <button
              onClick={setupTailscale}
              disabled={!authKey}
              className={`px-6 py-3 rounded-lg transition-colors ${
                authKey
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Start Setup
            </button>
            <button
              onClick={handleSkip}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Skip Tailscale
            </button>
          </>
        )}

        {status === 'error' && (
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry Setup
          </button>
        )}

        {status === 'complete' && (
          <button
            onClick={() => onComplete(true, tailscaleStatus)}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Continue to Next Step
          </button>
        )}
      </div>
    </div>
  );
};
