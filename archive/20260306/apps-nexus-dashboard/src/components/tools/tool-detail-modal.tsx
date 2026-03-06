'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tool } from '@/lib/store';
import { Copy, ExternalLink, Zap } from 'lucide-react';
import { useState } from 'react';

interface ToolDetailModalProps {
  tool: Tool | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTryTool?: (tool: Tool) => void;
  relatedTools?: Tool[];
}

export function ToolDetailModal({
  tool,
  open,
  onOpenChange,
  onTryTool,
  relatedTools = [],
}: ToolDetailModalProps) {
  const [copiedParam, setCopiedParam] = useState<string | null>(null);

  if (!tool) return null;

  const handleCopy = (text: string, param: string) => {
    navigator.clipboard.writeText(text);
    setCopiedParam(param);
    setTimeout(() => setCopiedParam(null), 2000);
  };

  const exampleUsage = `// Example usage
const result = await api.call('${tool.name}', {
  // Add parameters here
});`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{tool.name}</DialogTitle>
          <DialogDescription>{tool.description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-auto">
          <div className="space-y-6 pr-4">
            <div className="space-y-3">
              <h3 className="font-semibold">Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Category</div>
                  <Badge>{tool.category}</Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Server</div>
                  <Badge variant="secondary">{tool.server}</Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold">Parameters</h3>
              {Object.keys(tool.parameters).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(tool.parameters).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <code className="text-sm font-mono">{key}</code>
                        <div className="text-xs text-muted-foreground">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                        onClick={() =>
                          handleCopy(
                            `${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`,
                            key
                          )
                        }
                      >
                        <Copy
                          className={`h-3.5 w-3.5 ${
                            copiedParam === key ? 'text-green-500' : 'text-muted-foreground'
                          }`}
                        />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No parameters required</p>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold">Example Usage</h3>
              <div className="bg-muted/50 rounded p-3 overflow-x-auto">
                <code className="text-xs font-mono whitespace-pre-wrap break-words">
                  {exampleUsage}
                </code>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(exampleUsage, 'example')}
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copy Code
              </Button>
            </div>

            {relatedTools.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold">Related Tools</h3>
                  <div className="space-y-2">
                    {relatedTools.map((relatedTool) => (
                      <div key={relatedTool.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium text-sm">{relatedTool.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {relatedTool.description}
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="pt-4">
              <Button
                className="w-full"
                onClick={() => {
                  onTryTool?.(tool);
                  onOpenChange(false);
                }}
              >
                <Zap className="h-4 w-4 mr-2" />
                Try This Tool
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
