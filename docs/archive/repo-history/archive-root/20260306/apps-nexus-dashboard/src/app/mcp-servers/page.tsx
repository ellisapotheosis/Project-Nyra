'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MCPServerCard } from '@/components/mcp/server-card';
import { AddServerDialog } from '@/components/mcp/add-server-dialog';
import { ToolBrowser } from '@/components/mcp/tool-browser';
import { useNexusStore } from '@/lib/store';
import { NexusAPI } from '@/lib/api';
import { EnhancedMCPServer, MCPTool } from '@/lib/types/mcp';
import { Plus, RefreshCw, Server, Wrench } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MCPServersPage() {
  const {
    enhancedServers,
    mcpTools,
    setEnhancedServers,
    addEnhancedServer,
    updateEnhancedServer,
    deleteEnhancedServer,
    setMCPTools,
  } = useNexusStore();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<EnhancedMCPServer | undefined>();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchServers();
    fetchTools();
  }, []);

  const fetchServers = async () => {
    setLoading(true);
    try {
      // For now, use demo data until API is ready
      const demoServers: EnhancedMCPServer[] = [
        {
          id: '1',
          name: 'Filesystem Server',
          description: 'Local filesystem access via MCP',
          status: 'online',
          protocol: 'stdio',
          config: {
            protocol: 'stdio',
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
            authType: 'none',
          },
          enabled: true,
          toolsCount: 12,
          latency: 45,
          lastCheck: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Claude Flow Server',
          description: 'Claude Flow MCP server with swarm coordination',
          status: 'online',
          protocol: 'stdio',
          config: {
            protocol: 'stdio',
            command: 'npx',
            args: ['-y', '@claude-flow/cli@latest'],
            authType: 'none',
          },
          enabled: true,
          toolsCount: 85,
          latency: 62,
          lastCheck: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Remote API Server',
          description: 'External MCP server via HTTP',
          status: 'offline',
          protocol: 'http',
          config: {
            protocol: 'http',
            httpUrl: 'https://api.example.com/mcp',
            authType: 'bearer',
            bearerToken: '***',
          },
          enabled: false,
          toolsCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setEnhancedServers(demoServers);
    } catch (error) {
      console.error('Failed to fetch servers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch MCP servers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTools = async () => {
    try {
      // Demo tools data
      const demoTools: MCPTool[] = [
        {
          id: 'fs-read',
          name: 'read_file',
          description: 'Read contents of a file',
          serverId: '1',
          serverName: 'Filesystem Server',
          category: 'filesystem',
          parameters: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path to the file',
              },
            },
            required: ['path'],
          },
        },
        {
          id: 'fs-write',
          name: 'write_file',
          description: 'Write contents to a file',
          serverId: '1',
          serverName: 'Filesystem Server',
          category: 'filesystem',
          parameters: {
            type: 'object',
            properties: {
              path: { type: 'string' },
              content: { type: 'string' },
            },
            required: ['path', 'content'],
          },
        },
        {
          id: 'cf-agent-spawn',
          name: 'agent_spawn',
          description: 'Spawn a new agent',
          serverId: '2',
          serverName: 'Claude Flow Server',
          category: 'coordination',
          parameters: {
            type: 'object',
            properties: {
              agentType: { type: 'string' },
              config: { type: 'object' },
            },
            required: ['agentType'],
          },
        },
      ];
      setMCPTools(demoTools);
    } catch (error) {
      console.error('Failed to fetch tools:', error);
    }
  };

  const handleAddServer = async (
    server: Omit<
      EnhancedMCPServer,
      'id' | 'createdAt' | 'updatedAt' | 'status' | 'toolsCount' | 'latency' | 'lastCheck'
    >
  ) => {
    const newServer: EnhancedMCPServer = {
      ...server,
      id: `server-${Date.now()}`,
      status: 'offline',
      toolsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addEnhancedServer(newServer);
    toast({
      title: 'Server added',
      description: `${newServer.name} has been added successfully`,
    });

    // Test connection if enabled
    if (newServer.enabled) {
      handleTestServer(newServer.id);
    }
  };

  const handleTestServer = async (serverId: string) => {
    toast({
      title: 'Testing connection',
      description: 'Attempting to connect to server...',
    });

    // Simulate test
    setTimeout(() => {
      const success = Math.random() > 0.3;
      updateEnhancedServer(serverId, {
        status: success ? 'online' : 'error',
        latency: success ? Math.floor(Math.random() * 200) + 30 : undefined,
        lastCheck: new Date().toISOString(),
        toolsCount: success ? Math.floor(Math.random() * 50) + 10 : 0,
      });

      toast({
        title: success ? 'Connection successful' : 'Connection failed',
        description: success
          ? 'Server is online and ready'
          : 'Could not connect to server',
        variant: success ? 'default' : 'destructive',
      });
    }, 1500);
  };

  const handleDeleteServer = async (serverId: string) => {
    deleteEnhancedServer(serverId);
    toast({
      title: 'Server deleted',
      description: 'Server has been removed',
    });
  };

  const handleToggleEnabled = async (serverId: string) => {
    const server = enhancedServers.find((s) => s.id === serverId);
    if (!server) return;

    updateEnhancedServer(serverId, {
      enabled: !server.enabled,
      status: !server.enabled ? server.status : 'offline',
    });

    if (!server.enabled) {
      handleTestServer(serverId);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MCP Servers</h1>
          <p className="text-muted-foreground mt-1">
            Manage Model Context Protocol servers and browse available tools
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchServers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => {
            setEditingServer(undefined);
            setAddDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Server
          </Button>
        </div>
      </div>

      <Tabs defaultValue="servers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="servers" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Servers
            <Badge variant="secondary" className="ml-1">
              {enhancedServers.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Tools
            <Badge variant="secondary" className="ml-1">
              {mcpTools.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="servers" className="space-y-4">
          {enhancedServers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
              <Server className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No servers configured</p>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Server
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {enhancedServers.map((server) => (
                <MCPServerCard
                  key={server.id}
                  server={server}
                  onTest={() => handleTestServer(server.id)}
                  onEdit={() => {
                    setEditingServer(server);
                    setAddDialogOpen(true);
                  }}
                  onDelete={() => handleDeleteServer(server.id)}
                  onToggleEnabled={() => handleToggleEnabled(server.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tools">
          <ToolBrowser
            tools={mcpTools}
            onCallTool={(tool) => {
              toast({
                title: 'Tool execution',
                description: `Executing ${tool.name}...`,
              });
            }}
          />
        </TabsContent>
      </Tabs>

      <AddServerDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSave={handleAddServer}
        editingServer={editingServer}
      />
    </div>
  );
}
