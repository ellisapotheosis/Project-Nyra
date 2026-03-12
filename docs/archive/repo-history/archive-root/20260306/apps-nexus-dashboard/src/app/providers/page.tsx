'use client';

import { useEffect, useState } from 'react';
import { ProviderCard } from '@/components/providers/provider-card';
import { ProviderConfigModal } from '@/components/providers/provider-config-modal';
import { AddProviderDialog } from '@/components/providers/add-provider-dialog';
import { useNexusStore, AIProvider } from '@/lib/store';
import { NexusAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';

export default function ProvidersPage() {
  const { providers, setProviders, updateProvider, addProvider } = useNexusStore();
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const data = await NexusAPI.getProviders();
      // Transform API response to match our AIProvider interface
      const transformedProviders: AIProvider[] = data.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type as AIProvider['type'],
        status: 'offline' as const,
        enabled: true,
        apiKey: p.apiKey,
        tokenForwarding: false,
        config: p.config,
      }));
      setProviders(transformedProviders);
    } catch (error) {
      console.error('Failed to fetch providers:', error);
      // Demo data for development
      setProviders([
        {
          id: '1',
          name: 'Anthropic',
          type: 'anthropic',
          status: 'online',
          enabled: true,
          apiKey: 'sk-ant-***',
          tokenForwarding: true,
          lastHealthCheck: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'OpenAI',
          type: 'openai',
          status: 'online',
          enabled: true,
          apiKey: 'sk-***',
          tokenForwarding: false,
          lastHealthCheck: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Google',
          type: 'google',
          status: 'offline',
          enabled: false,
          tokenForwarding: false,
        },
        {
          id: '4',
          name: 'AWS Bedrock',
          type: 'aws-bedrock',
          status: 'error',
          enabled: true,
          tokenForwarding: true,
          lastHealthCheck: new Date(Date.now() - 300000).toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchProviders();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleTestProvider = async (providerId: string) => {
    try {
      const result = await NexusAPI.testProvider(providerId);
      if (result.success) {
        updateProvider(providerId, {
          status: 'online',
          lastHealthCheck: new Date().toISOString(),
        });
      } else {
        updateProvider(providerId, {
          status: 'error',
          lastHealthCheck: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to test provider:', error);
      updateProvider(providerId, {
        status: 'error',
        lastHealthCheck: new Date().toISOString(),
      });
    }
  };

  const handleToggleProvider = (providerId: string, enabled: boolean) => {
    updateProvider(providerId, { enabled });
  };

  const handleProviderClick = (provider: AIProvider) => {
    setSelectedProvider(provider);
    setIsConfigModalOpen(true);
  };

  const handleSaveConfig = (updates: Partial<AIProvider>) => {
    if (selectedProvider) {
      updateProvider(selectedProvider.id, updates);
    }
  };

  const handleAddProvider = (provider: Omit<AIProvider, 'id' | 'status' | 'lastHealthCheck'>) => {
    const newProvider: AIProvider = {
      ...provider,
      id: `provider-${Date.now()}`,
      status: 'offline',
      lastHealthCheck: undefined,
    };
    addProvider(newProvider);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Providers</h1>
          <p className="text-muted-foreground mt-1">
            Manage and configure AI provider integrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchProviders}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Provider
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onTest={() => handleTestProvider(provider.id)}
            onToggle={(enabled) => handleToggleProvider(provider.id, enabled)}
            onClick={() => handleProviderClick(provider)}
          />
        ))}
      </div>

      {providers.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No providers configured</p>
          <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Provider
          </Button>
        </div>
      )}

      <ProviderConfigModal
        provider={selectedProvider}
        open={isConfigModalOpen}
        onOpenChange={setIsConfigModalOpen}
        onSave={handleSaveConfig}
      />

      <AddProviderDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddProvider}
      />
    </div>
  );
}
