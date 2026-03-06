'use client';

import { useEffect, useState, useMemo } from 'react';
import { useNexusStore, AIModel } from '@/lib/store';
import { NexusAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, Search } from 'lucide-react';
import { ModelTable } from '@/components/models/model-table';
import { ModelDetailModal } from '@/components/models/model-detail-modal';
import { ModelFilters } from '@/components/models/model-filters';

export default function ModelsPage() {
  const { models, setModels, lastDiscovery, setLastDiscovery } = useNexusStore();
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [streamingFilter, setStreamingFilter] = useState<boolean | null>(null);
  const [toolsFilter, setToolsFilter] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await NexusAPI.getModels();
        // Transform API Model to AIModel
        const aiModels: AIModel[] = data.map((model) => ({
          id: model.id,
          name: model.name,
          alias: undefined,
          provider: model.providerId,
          contextLength: model.contextWindow || 4096,
          vramRequired: undefined,
          supportsStreaming: model.capabilities.includes('streaming'),
          supportsTools: model.capabilities.includes('tools'),
          costPer1kTokens: model.costPer1kTokens || 0,
          availability: 'online' as const,
          discoveredAt: model.discoveredAt,
          capabilities: model.capabilities,
        }));
        setModels(aiModels);
        setLastDiscovery(new Date().toISOString());
      } catch (error) {
        console.error('Failed to fetch models:', error);
        // Demo data
        setModels([
          {
            id: '1',
            name: 'GPT-4 Turbo',
            alias: 'gpt-4-turbo',
            provider: 'OpenAI',
            contextLength: 128000,
            vramRequired: 80,
            supportsStreaming: true,
            supportsTools: true,
            costPer1kTokens: 0.03,
            availability: 'online',
            discoveredAt: new Date().toISOString(),
            capabilities: ['text-generation', 'code', 'reasoning'],
          },
          {
            id: '2',
            name: 'Claude 3.5 Sonnet',
            alias: 'claude-3-5-sonnet-20241022',
            provider: 'Anthropic',
            contextLength: 200000,
            vramRequired: 90,
            supportsStreaming: true,
            supportsTools: true,
            costPer1kTokens: 0.015,
            availability: 'online',
            discoveredAt: new Date().toISOString(),
            capabilities: ['text-generation', 'analysis', 'coding'],
          },
          {
            id: '3',
            name: 'Gemini Pro',
            alias: 'gemini-pro',
            provider: 'Google',
            contextLength: 32000,
            vramRequired: 40,
            supportsStreaming: true,
            supportsTools: false,
            costPer1kTokens: 0.0005,
            availability: 'online',
            discoveredAt: new Date().toISOString(),
            capabilities: ['text-generation', 'multimodal'],
          },
          {
            id: '4',
            name: 'Llama 3.1 70B',
            alias: 'llama-3.1-70b',
            provider: 'Meta',
            contextLength: 128000,
            vramRequired: 140,
            supportsStreaming: true,
            supportsTools: true,
            costPer1kTokens: 0.0008,
            availability: 'limited',
            discoveredAt: new Date().toISOString(),
            capabilities: ['text-generation', 'open-source'],
          },
          {
            id: '5',
            name: 'Mistral Large',
            alias: 'mistral-large',
            provider: 'Mistral AI',
            contextLength: 32000,
            vramRequired: 50,
            supportsStreaming: true,
            supportsTools: true,
            costPer1kTokens: 0.012,
            availability: 'online',
            discoveredAt: new Date().toISOString(),
            capabilities: ['text-generation', 'multilingual'],
          },
        ]);
        setLastDiscovery(new Date().toISOString());
      }
    };

    fetchModels();
  }, [setModels, setLastDiscovery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await NexusAPI.refreshDiscovery();
      const data = await NexusAPI.getModels();
      const aiModels: AIModel[] = data.map((model) => ({
        id: model.id,
        name: model.name,
        alias: undefined,
        provider: model.providerId,
        contextLength: model.contextWindow || 4096,
        vramRequired: undefined,
        supportsStreaming: model.capabilities.includes('streaming'),
        supportsTools: model.capabilities.includes('tools'),
        costPer1kTokens: model.costPer1kTokens || 0,
        availability: 'online' as const,
        discoveredAt: model.discoveredAt,
        capabilities: model.capabilities,
      }));
      setModels(aiModels);
      setLastDiscovery(new Date().toISOString());
    } catch (error) {
      console.error('Failed to refresh models:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleModelClick = (model: AIModel) => {
    setSelectedModel(model);
    setModalOpen(true);
  };

  // Get unique providers for filter
  const availableProviders = useMemo(() => {
    return Array.from(new Set(models.map((m) => m.provider))).sort();
  }, [models]);

  // Filter models
  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          model.name.toLowerCase().includes(query) ||
          model.alias?.toLowerCase().includes(query) ||
          model.provider.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Provider filter
      if (selectedProviders.length > 0 && !selectedProviders.includes(model.provider)) {
        return false;
      }

      // Streaming filter
      if (streamingFilter !== null && model.supportsStreaming !== streamingFilter) {
        return false;
      }

      // Tools filter
      if (toolsFilter !== null && model.supportsTools !== toolsFilter) {
        return false;
      }

      return true;
    });
  }, [models, searchQuery, selectedProviders, streamingFilter, toolsFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Model Catalog</h1>
          <p className="text-muted-foreground mt-1">
            Browse and manage available AI models across providers
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Discovery
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {lastDiscovery && (
          <div className="text-sm text-muted-foreground">
            Last discovery: {new Date(lastDiscovery).toLocaleTimeString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
        <div>
          <ModelFilters
            selectedProviders={selectedProviders}
            onProviderChange={setSelectedProviders}
            streamingFilter={streamingFilter}
            onStreamingChange={setStreamingFilter}
            toolsFilter={toolsFilter}
            onToolsChange={setToolsFilter}
            availableProviders={availableProviders}
          />
        </div>

        <div>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredModels.length} of {models.length} models
          </div>
          <ModelTable models={filteredModels} onModelClick={handleModelClick} />
        </div>
      </div>

      <ModelDetailModal
        model={selectedModel}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
