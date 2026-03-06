'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Plus, Minus, Edit2, Copy } from 'lucide-react';

interface ConfigDiffViewerProps {
  current: string;
  previous: string;
  onRestore?: () => void;
  onApply?: () => void;
  title?: string;
  description?: string;
}

interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
  lineNumber?: number;
}

const computeDiff = (current: string, previous: string): DiffLine[] => {
  const currentLines = current.split('\n');
  const previousLines = previous.split('\n');
  const result: DiffLine[] = [];

  const maxLength = Math.max(currentLines.length, previousLines.length);

  for (let i = 0; i < maxLength; i++) {
    const prevLine = previousLines[i];
    const currLine = currentLines[i];

    if (prevLine === undefined) {
      // Added lines
      if (currLine !== undefined) {
        result.push({
          type: 'add',
          content: currLine,
          lineNumber: i + 1,
        });
      }
    } else if (currLine === undefined) {
      // Removed lines
      result.push({
        type: 'remove',
        content: prevLine,
        lineNumber: i + 1,
      });
    } else if (prevLine !== currLine) {
      // Changed lines - show both
      result.push({
        type: 'remove',
        content: prevLine,
        lineNumber: i + 1,
      });
      result.push({
        type: 'add',
        content: currLine,
        lineNumber: i + 1,
      });
    } else {
      // Context lines (unchanged) - show less frequently
      if (i === 0 || i === maxLength - 1 || (result.length > 0 && Math.random() > 0.7)) {
        result.push({
          type: 'context',
          content: currLine,
          lineNumber: i + 1,
        });
      }
    }
  }

  return result;
};

const formatDiffContent = (content: string): React.ReactNode => {
  if (!content) return <span className="text-muted-foreground italic">(empty)</span>;

  // Highlight TOML syntax in diff
  const result: React.ReactNode[] = [];
  const eqIndex = content.indexOf('=');

  if (eqIndex !== -1) {
    result.push(
      <span key="key" className="text-blue-600 dark:text-blue-400">
        {content.substring(0, eqIndex).trim()}
      </span>
    );
    result.push(' = ');
    result.push(
      <span key="value" className="text-red-600 dark:text-red-400">
        {content.substring(eqIndex + 1).trim()}
      </span>
    );
  } else if (content.trim().startsWith('[') && content.trim().endsWith(']')) {
    result.push(
      <span key="section" className="text-yellow-600 dark:text-yellow-400 font-semibold">
        {content}
      </span>
    );
  } else if (content.trim().startsWith('#')) {
    result.push(
      <span key="comment" className="text-green-600 dark:text-green-400">
        {content}
      </span>
    );
  } else {
    result.push(content);
  }

  return result;
};

export function ConfigDiffViewer({
  current,
  previous,
  onRestore,
  onApply,
  title = 'Configuration Diff',
  description = 'Compare current vs previous configuration',
}: ConfigDiffViewerProps) {
  const diffLines = useMemo(() => computeDiff(current, previous), [current, previous]);

  const stats = useMemo(() => {
    const added = diffLines.filter((l) => l.type === 'add').length;
    const removed = diffLines.filter((l) => l.type === 'remove').length;
    return { added, removed, total: added + removed };
  }, [diffLines]);

  const hasChanges = stats.total > 0;

  return (
    <Card className="bg-background">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex gap-2">
            {stats.added > 0 && (
              <Badge variant="outline" className="gap-1 border-green-600 text-green-600">
                <Plus className="h-3 w-3" />
                {stats.added} added
              </Badge>
            )}
            {stats.removed > 0 && (
              <Badge variant="outline" className="gap-1 border-red-600 text-red-600">
                <Minus className="h-3 w-3" />
                {stats.removed} removed
              </Badge>
            )}
            {!hasChanges && (
              <Badge variant="outline" className="gap-1">
                No changes
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {!hasChanges ? (
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Configurations are identical</p>
          </div>
        </CardContent>
      ) : (
        <>
          <CardContent className="space-y-0">
            <div className="border rounded-md overflow-hidden">
              {/* Header row */}
              <div className="flex bg-muted/50 border-b sticky top-0">
                <div className="w-12 flex items-center justify-center border-r text-xs text-muted-foreground font-mono flex-shrink-0">
                  #
                </div>
                <div className="flex-1 p-3 text-xs font-medium text-muted-foreground">
                  Changes
                </div>
              </div>

              {/* Diff lines */}
              <div className="font-mono text-sm max-h-96 overflow-y-auto">
                {diffLines.map((line, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex border-b last:border-b-0',
                      line.type === 'add' &&
                        'bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-900/40',
                      line.type === 'remove' &&
                        'bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40',
                      line.type === 'context' &&
                        'bg-muted/30 hover:bg-muted/50 opacity-60'
                    )}
                  >
                    {/* Line number */}
                    <div className="w-12 flex items-center justify-center flex-shrink-0 border-r text-xs text-muted-foreground font-mono">
                      {line.type === 'add' ? <Plus className="h-3 w-3 text-green-600" /> :
                       line.type === 'remove' ? <Minus className="h-3 w-3 text-red-600" /> :
                       <span className="text-muted-foreground">{line.lineNumber}</span>}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-3 overflow-x-auto whitespace-pre-wrap break-words">
                      <span className={cn(
                        line.type === 'add' && 'text-green-700 dark:text-green-300',
                        line.type === 'remove' && 'text-red-700 dark:text-red-300',
                        line.type === 'context' && 'text-foreground/70'
                      )}>
                        {formatDiffContent(line.content)}
                      </span>
                    </div>

                    {/* Action icons */}
                    {line.type !== 'context' && (
                      <div className="px-3 flex items-center justify-center">
                        <Copy className="h-3 w-3 cursor-pointer opacity-0 hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>

          {/* Actions */}
          <div className="px-6 py-4 border-t flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={onApply}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Apply Diff
            </Button>
            <Button
              variant="outline"
              onClick={onRestore}
              className="gap-2"
            >
              Restore Previous
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
