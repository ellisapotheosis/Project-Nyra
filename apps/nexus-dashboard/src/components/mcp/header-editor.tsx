'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Header {
  id: string;
  key: string;
  value: string;
  envVar?: string;
}

interface HeaderEditorProps {
  headers: Header[];
  onHeadersChange: (headers: Header[]) => void;
  environmentVars?: string[];
}

export function HeaderEditor({ headers, onHeadersChange, environmentVars = [] }: HeaderEditorProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showValues, setShowValues] = useState<Set<string>>(new Set());

  const addHeader = () => {
    const newHeader: Header = {
      id: `header-${Date.now()}`,
      key: '',
      value: '',
    };
    onHeadersChange([...headers, newHeader]);
  };

  const removeHeader = (id: string) => {
    onHeadersChange(headers.filter((h) => h.id !== id));
  };

  const updateHeader = (id: string, updates: Partial<Header>) => {
    onHeadersChange(
      headers.map((h) => (h.id === id ? { ...h, ...updates } : h))
    );
  };

  const moveHeader = (fromIndex: number, toIndex: number) => {
    const newHeaders = [...headers];
    const [movedHeader] = newHeaders.splice(fromIndex, 1);
    newHeaders.splice(toIndex, 0, movedHeader);
    onHeadersChange(newHeaders);
  };

  const toggleShowValue = (id: string) => {
    const newShowValues = new Set(showValues);
    if (newShowValues.has(id)) {
      newShowValues.delete(id);
    } else {
      newShowValues.add(id);
    }
    setShowValues(newShowValues);
  };

  const resolveValue = (value: string, envVar?: string): string => {
    if (envVar) {
      return value.replace(/\$\{[^}]+\}/g, (match) => {
        const varName = match.slice(2, -1);
        return envVar === varName ? `$${varName}` : match;
      });
    }
    return value;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>HTTP Headers</CardTitle>
        <CardDescription>
          Configure custom headers for MCP server requests. Use ${'{VARIABLE_NAME}'} for environment variables.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {headers.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No headers configured. Add one to get started.
            </div>
          ) : (
            headers.map((header, index) => (
              <div
                key={header.id}
                draggable
                onDragStart={() => setDraggedId(header.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  const draggedIndex = headers.findIndex((h) => h.id === draggedId);
                  if (draggedIndex !== -1 && draggedIndex !== index) {
                    moveHeader(draggedIndex, index);
                  }
                  setDraggedId(null);
                }}
                onDragEnd={() => setDraggedId(null)}
                className={cn(
                  'flex items-center gap-2 p-3 border rounded-lg transition-colors',
                  draggedId === header.id && 'bg-accent opacity-50'
                )}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />

                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Header key"
                    value={header.key}
                    onChange={(e) => updateHeader(header.id, { key: e.target.value })}
                    className="text-xs"
                  />

                  <div className="relative">
                    <Input
                      type={showValues.has(header.id) ? 'text' : 'password'}
                      placeholder="Header value"
                      value={header.value}
                      onChange={(e) => updateHeader(header.id, { value: e.target.value })}
                      className="text-xs pr-8"
                    />
                    <button
                      onClick={() => toggleShowValue(header.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showValues.has(header.id) ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {environmentVars.length > 0 && (
                  <Select
                    value={header.envVar || ''}
                    onValueChange={(value) =>
                      updateHeader(header.id, {
                        envVar: value || undefined,
                      })
                    }
                  >
                    <SelectTrigger className="w-24 h-10 text-xs">
                      <SelectValue placeholder="Env Var" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {environmentVars.map((envVar) => (
                        <SelectItem key={envVar} value={envVar}>
                          {envVar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeHeader(header.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        <Button onClick={addHeader} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Header
        </Button>

        {headers.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <Label className="text-xs font-semibold mb-2 block">Preview</Label>
            <div className="space-y-1 text-xs font-mono">
              {headers.map((header) => (
                <div key={header.id} className="text-muted-foreground">
                  <span className="text-primary">{header.key}</span>
                  <span className="text-muted-foreground">: </span>
                  <span>
                    {showValues.has(header.id)
                      ? resolveValue(header.value, header.envVar)
                      : '••••••'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
