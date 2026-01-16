import React, { useState, useEffect } from 'react';
import { DockerService, DockerContainer, DockerContainerStatus } from '../types/manifest';

interface DockerSetupProps {
  onComplete?: () => void;
}

export const DockerSetup: React.FC<DockerSetupProps> = ({ onComplete }) => {
  const [services, setServices] = useState<DockerService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDockerServices();
  }, []);

  const loadDockerServices = async () => {
    setLoading(true);
    try {
      // TODO: Call backend API to get Docker services
      // Mock data for now
      const mockServices: DockerService[] = [
        {
          name: 'infisical',
          displayName: 'Infisical',
          description: 'Secret management service',
          required: true,
          containers: [
            {
              id: 'infisical-1',
              name: 'infisical',
              image: 'infisical/infisical:latest',
              status: 'running',
              ports: ['8080:8080'],
              created: new Date(),
              health: 'healthy',
            },
          ],
        },
        {
          name: 'gitea',
          displayName: 'Gitea',
          description: 'Git service with web interface',
          required: false,
          containers: [
            {
              id: 'gitea-1',
              name: 'gitea',
              image: 'gitea/gitea:latest',
              status: 'stopped',
              ports: ['3000:3000', '2222:22'],
              created: new Date(),
            },
          ],
        },
        {
          name: 'postgres',
          displayName: 'PostgreSQL',
          description: 'Database for services',
          required: true,
          containers: [
            {
              id: 'postgres-1',
              name: 'postgres',
              image: 'postgres:16',
              status: 'running',
              ports: ['5432:5432'],
              created: new Date(),
              health: 'healthy',
            },
          ],
        },
      ];

      setServices(mockServices);
    } catch (error) {
      console.error('Failed to load Docker services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDockerServices();
    setRefreshing(false);
  };

  const handleStartService = async (serviceName: string) => {
    console.log('Starting service:', serviceName);
    // TODO: Call backend API to start service
    // Simulate API call
    setTimeout(() => {
      setServices((prev) =>
        prev.map((service) =>
          service.name === serviceName
            ? {
                ...service,
                containers: service.containers.map((c) => ({
                  ...c,
                  status: 'running' as DockerContainerStatus,
                  health: 'starting',
                })),
              }
            : service
        )
      );
    }, 1000);
  };

  const handleStopService = async (serviceName: string) => {
    console.log('Stopping service:', serviceName);
    // TODO: Call backend API to stop service
    setTimeout(() => {
      setServices((prev) =>
        prev.map((service) =>
          service.name === serviceName
            ? {
                ...service,
                containers: service.containers.map((c) => ({
                  ...c,
                  status: 'stopped' as DockerContainerStatus,
                  health: undefined,
                })),
              }
            : service
        )
      );
    }, 1000);
  };

  const handleRestartService = async (serviceName: string) => {
    console.log('Restarting service:', serviceName);
    // TODO: Call backend API to restart service
    await handleStopService(serviceName);
    setTimeout(() => handleStartService(serviceName), 1500);
  };

  const getStatusColor = (status: DockerContainerStatus) => {
    switch (status) {
      case 'running':
        return 'text-green-600 bg-green-100';
      case 'stopped':
        return 'text-gray-600 bg-gray-100';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100';
      case 'restarting':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-red-600 bg-red-100';
    }
  };

  const getHealthIcon = (health?: string) => {
    switch (health) {
      case 'healthy':
        return '✓';
      case 'unhealthy':
        return '✗';
      case 'starting':
        return '⏳';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Docker services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Docker Services</h1>
          <p className="text-gray-600">Manage containerized services for your deployment</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <span className={refreshing ? 'animate-spin' : ''}>↻</span>
          Refresh
        </button>
      </div>

      <div className="space-y-6">
        {services.map((service) => {
          const isRunning = service.containers.some((c) => c.status === 'running');

          return (
            <div
              key={service.name}
              className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{service.displayName}</h3>
                    {service.required && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartService(service.name)}
                    disabled={isRunning}
                    className="px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start
                  </button>
                  <button
                    onClick={() => handleStopService(service.name)}
                    disabled={!isRunning}
                    className="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Stop
                  </button>
                  <button
                    onClick={() => handleRestartService(service.name)}
                    disabled={!isRunning}
                    className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Restart
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {service.containers.map((container) => (
                  <div
                    key={container.id}
                    className="bg-gray-50 rounded p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-900">{container.name}</h4>
                        <span
                          className={`px-2 py-0.5 text-xs rounded font-medium ${getStatusColor(
                            container.status
                          )}`}
                        >
                          {container.status}
                        </span>
                        {container.health && (
                          <span
                            className={`px-2 py-0.5 text-xs rounded font-medium ${
                              container.health === 'healthy'
                                ? 'text-green-600 bg-green-50'
                                : container.health === 'unhealthy'
                                ? 'text-red-600 bg-red-50'
                                : 'text-yellow-600 bg-yellow-50'
                            }`}
                          >
                            {getHealthIcon(container.health)} {container.health}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {container.created.toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Image:</span>
                        <code className="bg-gray-200 px-2 py-0.5 rounded text-xs">
                          {container.image}
                        </code>
                      </div>
                      {container.ports.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Ports:</span>
                          <div className="flex gap-2">
                            {container.ports.map((port) => (
                              <code
                                key={port}
                                className="bg-gray-200 px-2 py-0.5 rounded text-xs"
                              >
                                {port}
                              </code>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex gap-4 justify-center">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onComplete}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
