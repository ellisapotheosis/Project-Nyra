'use client';

import { useEffect } from 'react';
import { ToolSearch } from '@/components/tool-search';
import { useNexusStore } from '@/lib/store';
import { NexusAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function ToolsPage() {
  const { tools, setTools } = useNexusStore();

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const data = await NexusAPI.getTools();
        setTools(data);
      } catch (error) {
        console.error('Failed to fetch tools:', error);
        // Demo data
        setTools([
          {
            id: '1',
            name: 'text_completion',
            description: 'Generate text completions using AI models',
            server: 'Primary MCP Server',
            category: 'AI',
            parameters: {
              prompt: 'string',
              model: 'string',
              max_tokens: 'number',
            },
          },
          {
            id: '2',
            name: 'image_generation',
            description: 'Generate images from text descriptions',
            server: 'Primary MCP Server',
            category: 'AI',
            parameters: {
              prompt: 'string',
              size: 'string',
              quality: 'string',
            },
          },
          {
            id: '3',
            name: 'code_analyzer',
            description: 'Analyze code for bugs and optimization opportunities',
            server: 'Secondary MCP Server',
            category: 'Development',
            parameters: {
              code: 'string',
              language: 'string',
            },
          },
          {
            id: '4',
            name: 'vector_search',
            description: 'Perform semantic search across vector embeddings',
            server: 'Secondary MCP Server',
            category: 'Search',
            parameters: {
              query: 'string',
              top_k: 'number',
              threshold: 'number',
            },
          },
          {
            id: '5',
            name: 'sentiment_analysis',
            description: 'Analyze sentiment of text content',
            server: 'Primary MCP Server',
            category: 'NLP',
            parameters: {
              text: 'string',
              detailed: 'boolean',
            },
          },
        ]);
      }
    };

    fetchTools();
  }, [setTools]);

  const handleRefresh = async () => {
    try {
      const data = await NexusAPI.getTools();
      setTools(data);
    } catch (error) {
      console.error('Failed to refresh tools:', error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tool Search</h1>
          <p className="text-muted-foreground mt-1">
            Search and explore available MCP tools across all servers
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <ToolSearch tools={tools} />
    </div>
  );
}
