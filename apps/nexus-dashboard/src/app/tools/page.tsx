'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNexusStore, Tool } from '@/lib/store';
import { NexusAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Grid, List } from 'lucide-react';
import { SearchBar, ToolCard, ToolDetailModal, TryToolDialog } from '@/components/tools';

export default function ToolsPage() {
  const { tools, setTools } = useNexusStore();
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [tryOpen, setTryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Tool[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(tools.map((t) => t.category));
    return Array.from(cats).sort();
  }, [tools]);

  // Get related tools
  const relatedTools = useMemo(() => {
    if (!selectedTool) return [];
    return tools
      .filter(
        (t) =>
          t.id !== selectedTool.id &&
          (t.category === selectedTool.category || t.server === selectedTool.server)
      )
      .slice(0, 3);
  }, [selectedTool, tools]);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const data = await NexusAPI.getTools();
        setTools(data);
        setSearchResults(data);
      } catch (error) {
        console.error('Failed to fetch tools:', error);
        // Demo data
        const demoData = [
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
          {
            id: '6',
            name: 'document_summarization',
            description: 'Summarize long documents into concise summaries',
            server: 'Secondary MCP Server',
            category: 'NLP',
            parameters: {
              document: 'text',
              length: 'short|medium|long',
            },
          },
          {
            id: '7',
            name: 'entity_extraction',
            description: 'Extract named entities from text content',
            server: 'Primary MCP Server',
            category: 'NLP',
            parameters: {
              text: 'string',
              types: 'array',
            },
          },
          {
            id: '8',
            name: 'model_performance_metrics',
            description: 'Get performance metrics for deployed models',
            server: 'Monitoring Server',
            category: 'Monitoring',
            parameters: {
              model_id: 'string',
              time_range: 'string',
            },
          },
        ];
        setTools(demoData);
        setSearchResults(demoData);
      }
    };

    fetchTools();
  }, [setTools]);

  const handleRefresh = useCallback(async () => {
    try {
      const data = await NexusAPI.getTools();
      setTools(data);
      setSearchResults(data);
    } catch (error) {
      console.error('Failed to refresh tools:', error);
    }
  }, [setTools]);

  const handleSearch = useCallback((query: string, results: Tool[]) => {
    setSearchQuery(query);
    setSearchResults(results);
  }, []);

  const handleFilterCategory = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleViewDetails = useCallback((tool: Tool) => {
    setSelectedTool(tool);
    setDetailOpen(true);
  }, []);

  const handleTryTool = useCallback((tool: Tool) => {
    setSelectedTool(tool);
    setTryOpen(true);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tool Discovery</h1>
          <p className="text-muted-foreground mt-1">
            Search and explore available MCP tools across all servers
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search Bar */}
      <SearchBar
        tools={tools}
        onSearch={handleSearch}
        onFilterCategory={handleFilterCategory}
        categories={categories}
      />

      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {searchResults.length} tool{searchResults.length !== 1 ? 's' : ''} found
          {selectedCategory && ` in "${selectedCategory}"`}
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tools Display */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Tools</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {searchResults.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-3'
              }
            >
              {searchResults.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onViewDetails={handleViewDetails}
                  onTryTool={handleTryTool}
                  usageCount={Math.floor(Math.random() * 100)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tools found matching your search.</p>
            </div>
          )}
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            {searchResults.filter((t) => t.category === category).length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-3'
                }
              >
                {searchResults
                  .filter((t) => t.category === category)
                  .map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      onViewDetails={handleViewDetails}
                      onTryTool={handleTryTool}
                      usageCount={Math.floor(Math.random() * 100)}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tools in {category}.</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Modals */}
      <ToolDetailModal
        tool={selectedTool}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onTryTool={handleTryTool}
        relatedTools={relatedTools}
      />

      <TryToolDialog
        tool={selectedTool}
        open={tryOpen}
        onOpenChange={setTryOpen}
      />
    </div>
  );
}
