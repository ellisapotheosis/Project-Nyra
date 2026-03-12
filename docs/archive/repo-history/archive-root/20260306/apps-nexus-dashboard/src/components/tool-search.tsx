'use client';

import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { Tool } from '@/lib/store';

interface ToolSearchProps {
  tools: Tool[];
}

export function ToolSearch({ tools }: ToolSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const fuse = useMemo(
    () =>
      new Fuse(tools, {
        keys: ['name', 'description', 'category', 'server'],
        threshold: 0.3,
        includeScore: true,
      }),
    [tools]
  );

  const searchResults = useMemo(() => {
    if (!searchQuery) return tools;
    return fuse.search(searchQuery).map((result) => result.item);
  }, [searchQuery, fuse, tools]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tools by name, description, category, or server..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="text-sm text-muted-foreground">
        Found {searchResults.length} tool{searchResults.length !== 1 ? 's' : ''}
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-3">
          {searchResults.map((tool) => (
            <Card key={tool.id} className="hover:shadow-md transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{tool.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {tool.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{tool.category}</Badge>
                    <Badge variant="secondary">{tool.server}</Badge>
                  </div>
                </div>
              </CardHeader>
              {Object.keys(tool.parameters).length > 0 && (
                <CardContent>
                  <div className="text-sm">
                    <div className="font-medium text-muted-foreground mb-2">
                      Parameters
                    </div>
                    <div className="space-y-1">
                      {Object.entries(tool.parameters).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 text-xs">
                          <code className="px-2 py-1 bg-muted rounded font-mono">
                            {key}
                          </code>
                          <span className="text-muted-foreground">
                            {typeof value === 'object'
                              ? JSON.stringify(value)
                              : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
