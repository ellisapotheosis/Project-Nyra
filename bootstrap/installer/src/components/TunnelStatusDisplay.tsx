import React, { useEffect, useState } from 'react';
import { CloudflareTunnelService, TunnelConnectionTest } from '../types/manifest';

interface TunnelStatusDisplayProps {
  tunnelName: string;
  tunnelUrl?: string;
  services: CloudflareTunnelService[];
  onTestConnections: () => Promise<TunnelConnectionTest[]>;
}

export const TunnelStatusDisplay: React.FC<TunnelStatusDisplayProps> = ({
  tunnelName,
  tunnelUrl,
  services,
  onTestConnections,
}) => {
  const [connectionTests, setConnectionTests] = useState<TunnelConnectionTest[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const runTests = async () => {
    setIsTesting(true);
    try {
      const results = await onTestConnections();
      setConnectionTests(results);
    } catch (error) {
      console.error('Failed to test connections:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusColor = (status: TunnelConnectionTest['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'testing':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: TunnelConnectionTest['status']) => {
    switch (status) {
      case 'success':
        return '✓';
      case 'failed':
        return '✗';
      case 'testing':
        return '⏳';
      default:
        return '○';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Tunnel Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Tunnel Active: {tunnelName}
            </h3>
            {tunnelUrl && (
              <div className="flex items-center gap-2">
                <code className="text-sm text-blue-700 bg-white px-3 py-1 rounded">
                  {tunnelUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(tunnelUrl)}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-white rounded transition-colors"
                  title="Copy tunnel URL"
                >
                  📋 Copy
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-green-800">Connected</span>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Exposed Services</h4>
          <button
            onClick={runTests}
            disabled={isTesting}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? 'Testing...' : 'Test All Connections'}
          </button>
        </div>

        <div className="space-y-3">
          {services
            .filter((service) => service.enabled)
            .map((service) => {
              const test = connectionTests.find((t) => t.service === service.id);
              const serviceUrl = service.hostname || `${tunnelUrl}/${service.name}`;

              return (
                <div
                  key={service.id}
                  className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h5 className="font-semibold text-gray-900">
                          {service.displayName}
                        </h5>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                          {service.protocol.toUpperCase()}:{service.port}
                        </span>
                        {test && (
                          <span
                            className={`px-2 py-0.5 text-xs rounded flex items-center gap-1 ${getStatusColor(
                              test.status
                            )}`}
                          >
                            <span>{getStatusIcon(test.status)}</span>
                            <span className="font-medium">
                              {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                            </span>
                            {test.responseTime && (
                              <span>({test.responseTime}ms)</span>
                            )}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <a
                          href={serviceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline break-all"
                        >
                          {serviceUrl}
                        </a>
                        <button
                          onClick={() => copyToClipboard(serviceUrl)}
                          className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Copy URL"
                        >
                          📋
                        </button>
                      </div>

                      <p className="text-sm text-gray-600">{service.description}</p>

                      {test?.error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                          Error: {test.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-semibold text-blue-900 mb-2">Tunnel Configuration Complete</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Your services are now accessible via Cloudflare Tunnel</li>
          <li>• All traffic is encrypted and routed through Cloudflare's network</li>
          <li>• No inbound firewall rules or port forwarding required</li>
          <li>• Access your services using the URLs shown above</li>
        </ul>
      </div>
    </div>
  );
};
