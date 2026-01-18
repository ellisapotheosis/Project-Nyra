'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MCPTool } from '@/lib/types/mcp';
import { Search, Wrench, PlayCircle, Server } from 'lucide-react';

interface ToolBrowserProps {
  tools: MCPTool[];
  onCallTool?: (tool: MCPTool) => void;
}

export function ToolBrowser({ tools, onCallTool }: ToolBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);

  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.serverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedTools = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.serverName]) {
      acc[tool.serverName] = [];
    }
    acc[tool.serverName].push(tool);
    return acc;
  }, {} as Record<string, MCPTool[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools by name, description, server, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary" className="whitespace-nowrap">
          {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
        </Badge>
      </div>

      <ScrollArea className="h-[600px] rounded-md border">
        <div className="p-4 space-y-6">
          {Object.entries(groupedTools).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No tools found matching your search' : 'No tools available'}
              </p>
            </div>
          ) : (
            Object.entries(groupedTools).map(([serverName, serverTools]) => (
              <div key={serverName} className="space-y-3">
                <div className="flex items-center gap-2 sticky top-0 bg-background py-2 border-b">
                  <Server className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">{serverName}</h3>
                  <Badge variant="outline" className="ml-auto">
                    {serverTools.length}
                  </Badge>
                </div>

                <div className="grid gap-3">
                  {serverTools.map((tool) => (
                    <Card
                      key={tool.id}
                      className="cursor-pointer transition-all hover:shadow-md"
                      onClick={() => setSelectedTool(tool)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Wrench className="h-4 w-4" />
                              {tool.name}
                            </CardTitle>
                            {tool.category && (
                              <Badge variant="secondary" className="text-xs">
                                {tool.category}
                              </Badge>
                            )}
                          </div>
                          {onCallTool && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                onCallTool(tool);
                              }}
                              className="h-8 w-8"
                            >
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm">
                          {tool.description || 'No description available'}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Tool Details Dialog */}
      <Dialog open={!!selectedTool} onOpenChange={() => setSelectedTool(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              {selectedTool?.name}
            </DialogTitle>
            <DialogDescription>
              From {selectedTool?.serverName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {selectedTool?.description || 'No description available'}
              </p>
            </div>

            {selectedTool?.category && (
              <div>
                <h4 className="font-semibold mb-2">Category</h4>
                <Badge variant="secondary">{selectedTool.category}</Badge>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-2">Parameters</h4>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                <pre className="text-xs">
                  {JSON.stringify(selectedTool?.parameters, null, 2)}
                </pre>
              </ScrollArea>
            </div>

            {onCallTool && selectedTool && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedTool(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    onCallTool(selectedTool);
                    setSelectedTool(null);
                  }}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Try Tool
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
