import React, { useState, useEffect } from 'react';
import { useInstallStore } from '../store/installStore';
import { TunnelConfigForm } from './TunnelConfigForm';
import { TunnelStatusDisplay } from './TunnelStatusDisplay';
import {
  CloudflareTunnelService,
  CloudflareTunnelConfig,
  TunnelConnectionTest,
} from '../types/manifest';

interface CloudflareTunnelSetupProps {
  onComplete: () => void;
}

export const CloudflareTunnelSetup: React.FC<CloudflareTunnelSetupProps> = ({
  onComplete,
}) => {
  const { selectedPC, cloudflareTunnel, setCloudflareTunnel, setPhase, addLog } =
    useInstallStore();
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [pcType, setPcType] = useState<string>('');

  // Detect PC type on mount
  useEffect(() => {
    if (selectedPC) {
      setPcType(selectedPC);
      addLog({
        level: 'info',
        message: `Detected PC type: ${selectedPC}`,
        component: 'Cloudflare Tunnel',
      });
    }
  }, [selectedPC]);

  // Define available services based on PC type
  const getAvailableServices = (): CloudflareTunnelService[] => {
    const baseServices: CloudflareTunnelService[] = [
      {
        id: 'claude-desktop',
        name: 'claude-desktop',
        displayName: 'Claude Desktop',
        description: 'Claude Code MCP server endpoint',
        port: 3000,
        protocol: 'http',
        enabled: false,
      },
      {
        id: 'docker-api',
        name: 'docker-api',
        displayName: 'Docker API',
        description: 'Docker daemon API for remote management',
        port: 2375,
        protocol: 'http',
        enabled: false,
      },
      {
        id: 'ssh',
        name: 'ssh',
        displayName: 'SSH Access',
        description: 'Secure shell access to the machine',
        port: 22,
        protocol: 'ssh',
        enabled: false,
      },
    ];

    // Add PC-specific services
    if (selectedPC === 'orchestrator-mini') {
      baseServices.push(
        {
          id: 'gitea',
          name: 'gitea',
          displayName: 'Gitea (Git Server)',
          description: 'Self-hosted Git repository management',
          port: 3300,
          protocol: 'http',
          enabled: false,
        },
        {
          id: 'n8n',
          name: 'n8n',
          displayName: 'n8n (Workflow Automation)',
          description: 'Workflow automation platform',
          port: 5678,
          protocol: 'http',
          enabled: false,
        }
      );
    }

    // Add worker-specific services for GPU workers
    if (selectedPC?.includes('worker-rtx')) {
      baseServices.push({
        id: 'ollama',
        name: 'ollama',
        displayName: 'Ollama API',
        description: 'Local LLM inference API',
        port: 11434,
        protocol: 'http',
        enabled: false,
      });
    }

    return baseServices;
  };

  const availableServices = getAvailableServices();

  const handleConfigureSubmit = async (
    apiToken: string,
    tunnelName: string,
    selectedServiceIds: Set<string>
  ) => {
    setIsConfiguring(true);

    try {
      addLog({
        level: 'info',
        message: 'Configuring Cloudflare Tunnel...',
        component: 'Cloudflare Tunnel',
      });

      // Mark selected services as enabled
      const configuredServices = availableServices.map((service) => ({
        ...service,
        enabled: selectedServiceIds.has(service.id),
      }));

      // Simulate tunnel creation (in real implementation, this would call Cloudflare API)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const tunnelConfig: CloudflareTunnelConfig = {
        apiToken,
        tunnelName,
        services: configuredServices,
        status: 'configuring',
      };

      setCloudflareTunnel(tunnelConfig);

      addLog({
        level: 'info',
        message: 'Creating Cloudflare Tunnel...',
        component: 'Cloudflare Tunnel',
      });

      // Simulate tunnel activation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const activeTunnelConfig: CloudflareTunnelConfig = {
        ...tunnelConfig,
        status: 'active',
        tunnelUrl: `https://${tunnelName}.tunnel.cloudflare.com`,
        tunnelId: `tunnel-${Date.now()}`,
      };

      setCloudflareTunnel(activeTunnelConfig);

      addLog({
        level: 'success',
        message: `Cloudflare Tunnel "${tunnelName}" activated successfully`,
        component: 'Cloudflare Tunnel',
        details: `Tunnel URL: ${activeTunnelConfig.tunnelUrl}`,
      });
    } catch (error) {
      addLog({
        level: 'error',
        message: 'Failed to configure Cloudflare Tunnel',
        component: 'Cloudflare Tunnel',
        details: error instanceof Error ? error.message : 'Unknown error',
      });

      setCloudflareTunnel({
        apiToken: '',
        tunnelName,
        services: availableServices,
        status: 'error',
        error: error instanceof Error ? error.message : 'Configuration failed',
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleTestConnections = async (): Promise<TunnelConnectionTest[]> => {
    if (!cloudflareTunnel) return [];

    const enabledServices = cloudflareTunnel.services.filter((s) => s.enabled);

    addLog({
      level: 'info',
      message: `Testing connectivity for ${enabledServices.length} services...`,
      component: 'Cloudflare Tunnel',
    });

    const tests: TunnelConnectionTest[] = await Promise.all(
      enabledServices.map(async (service) => {
        const serviceUrl = service.hostname || `${cloudflareTunnel.tunnelUrl}/${service.name}`;

        // Simulate connection test
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

        const success = Math.random() > 0.2; // 80% success rate simulation

        const test: TunnelConnectionTest = {
          service: service.id,
          url: serviceUrl,
          status: success ? 'success' : 'failed',
          responseTime: success ? Math.floor(50 + Math.random() * 200) : undefined,
          error: success ? undefined : 'Connection timeout',
        };

        addLog({
          level: success ? 'success' : 'warn',
          message: `${service.displayName}: ${success ? 'Connected' : 'Failed'}`,
          component: 'Cloudflare Tunnel',
          details: success
            ? `Response time: ${test.responseTime}ms`
            : test.error,
        });

        return test;
      })
    );

    return tests;
  };

  const handleSkip = () => {
    addLog({
      level: 'info',
      message: 'Skipping Cloudflare Tunnel configuration',
      component: 'Cloudflare Tunnel',
    });
    onComplete();
  };

  if (!selectedPC) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-500">Please select a PC first</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configure Cloudflare Tunnels</h1>
        <p className="text-gray-600">
          Expose services securely through Cloudflare's network without port forwarding
        </p>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
            PC Type: {pcType}
          </span>
          <span className="text-gray-500">
            {availableServices.length} services available
          </span>
        </div>
      </div>

      {/* Configuration or Status Display */}
      {!cloudflareTunnel || cloudflareTunnel.status === 'idle' || cloudflareTunnel.status === 'error' ? (
        <>
          {cloudflareTunnel?.status === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-1">Configuration Failed</h3>
              <p className="text-sm text-red-700">{cloudflareTunnel.error}</p>
            </div>
          )}

          <TunnelConfigForm
            onSubmit={handleConfigureSubmit}
            availableServices={availableServices}
            isLoading={isConfiguring}
          />
        </>
      ) : (
        <TunnelStatusDisplay
          tunnelName={cloudflareTunnel.tunnelName}
          tunnelUrl={cloudflareTunnel.tunnelUrl}
          services={cloudflareTunnel.services}
          onTestConnections={handleTestConnections}
        />
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4 justify-center">
        <button
          onClick={() => setPhase('docker')}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
        >
          Back
        </button>

        {cloudflareTunnel?.status === 'active' ? (
          <button
            onClick={onComplete}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Continue to Configuration
          </button>
        ) : (
          <button
            onClick={handleSkip}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Skip Tunnel Setup
          </button>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-semibold text-amber-900 mb-2">About Cloudflare Tunnels</h3>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• Secure remote access without exposing ports to the internet</li>
          <li>• All traffic encrypted and authenticated through Cloudflare</li>
          <li>• No need for VPN or dynamic DNS setup</li>
          <li>• Built-in DDoS protection and access control</li>
          <li>• Free for personal use (requires Cloudflare account)</li>
        </ul>
      </div>
    </div>
  );
};
