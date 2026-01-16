import React, { useState } from 'react';
import { CloudflareTunnelService } from '../types/manifest';

interface TunnelConfigFormProps {
  onSubmit: (apiToken: string, tunnelName: string, selectedServices: Set<string>) => void;
  availableServices: CloudflareTunnelService[];
  isLoading: boolean;
}

export const TunnelConfigForm: React.FC<TunnelConfigFormProps> = ({
  onSubmit,
  availableServices,
  isLoading,
}) => {
  const [apiToken, setApiToken] = useState('');
  const [tunnelName, setTunnelName] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiToken && tunnelName && selectedServices.size > 0) {
      onSubmit(apiToken, tunnelName, selectedServices);
    }
  };

  const toggleService = (serviceId: string) => {
    const newServices = new Set(selectedServices);
    if (newServices.has(serviceId)) {
      newServices.delete(serviceId);
    } else {
      newServices.add(serviceId);
    }
    setSelectedServices(newServices);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* API Token Input */}
      <div>
        <label htmlFor="apiToken" className="block text-sm font-medium text-gray-700 mb-2">
          Cloudflare API Token
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <input
            id="apiToken"
            type={showToken ? 'text' : 'password'}
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            placeholder="Enter your Cloudflare API token"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-20"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
          >
            {showToken ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Create a token at{' '}
          <a
            href="https://dash.cloudflare.com/profile/api-tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Cloudflare Dashboard
          </a>{' '}
          with "Cloudflare Tunnel" template
        </p>
      </div>

      {/* Tunnel Name Input */}
      <div>
        <label htmlFor="tunnelName" className="block text-sm font-medium text-gray-700 mb-2">
          Tunnel Name
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          id="tunnelName"
          type="text"
          value={tunnelName}
          onChange={(e) => setTunnelName(e.target.value)}
          placeholder="e.g., nyra-orchestrator"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-gray-500">
          A unique name for this tunnel configuration
        </p>
      </div>

      {/* Service Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Services to Expose
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="space-y-2">
          {availableServices.map((service) => {
            const isSelected = selectedServices.has(service.id);

            return (
              <div
                key={service.id}
                className={`
                  p-4 rounded-lg border-2 transition-all cursor-pointer
                  ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => !isLoading && toggleService(service.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center h-6">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleService(service.id)}
                      disabled={isLoading}
                      className="w-4 h-4"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {service.displayName}
                      </h4>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                        {service.protocol.toUpperCase()}:{service.port}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selectedServices.size === 0 && (
          <p className="mt-2 text-sm text-amber-600">
            Please select at least one service to expose
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={!apiToken || !tunnelName || selectedServices.size === 0 || isLoading}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⏳</span>
              Configuring Tunnel...
            </>
          ) : (
            'Configure Tunnel'
          )}
        </button>
      </div>
    </form>
  );
};
