'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AIModel } from '@/lib/store';
import { formatBytes } from '@/lib/utils';
import { ArrowUpDown, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModelTableProps {
  models: AIModel[];
  onModelClick: (model: AIModel) => void;
}

type SortField = 'name' | 'provider' | 'contextLength' | 'cost' | 'availability';
type SortDirection = 'asc' | 'desc';

export function ModelTable({ models, onModelClick }: ModelTableProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedModels = [...models].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    switch (sortField) {
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'provider':
        aVal = a.provider.toLowerCase();
        bVal = b.provider.toLowerCase();
        break;
      case 'contextLength':
        aVal = a.contextLength;
        bVal = b.contextLength;
        break;
      case 'cost':
        aVal = a.costPer1kTokens;
        bVal = b.costPer1kTokens;
        break;
      case 'availability':
        aVal = a.availability;
        bVal = b.availability;
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const statusColors = {
    online: 'success',
    offline: 'destructive',
    limited: 'warning',
  } as const;

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => handleSort('name')}
              >
                Model Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => handleSort('provider')}
              >
                Provider
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => handleSort('contextLength')}
              >
                Context
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>VRAM</TableHead>
            <TableHead className="text-center">Streaming</TableHead>
            <TableHead className="text-center">Tools</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => handleSort('cost')}
              >
                Cost/1K
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => handleSort('availability')}
              >
                Status
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedModels.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No models found
              </TableCell>
            </TableRow>
          ) : (
            sortedModels.map((model) => (
              <TableRow
                key={model.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onModelClick(model)}
              >
                <TableCell className="font-medium">
                  <div>
                    <div>{model.name}</div>
                    {model.alias && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {model.alias}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{model.provider}</TableCell>
                <TableCell className="font-mono text-sm">
                  {(model.contextLength / 1000).toFixed(0)}K
                </TableCell>
                <TableCell className="text-sm">
                  {model.vramRequired
                    ? formatBytes(model.vramRequired * 1024 * 1024 * 1024)
                    : '-'}
                </TableCell>
                <TableCell className="text-center">
                  {model.supportsStreaming ? (
                    <Badge variant="success" className="text-xs">
                      Yes
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">No</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {model.supportsTools ? (
                    <Badge variant="success" className="text-xs">
                      Yes
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">No</span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  ${model.costPer1kTokens.toFixed(4)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusColors[model.availability]}>
                    {model.availability}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onModelClick(model);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
