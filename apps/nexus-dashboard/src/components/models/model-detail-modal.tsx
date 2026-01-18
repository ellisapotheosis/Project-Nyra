'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AIModel } from '@/lib/store';
import { formatBytes } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface ModelDetailModalProps {
  model: AIModel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModelDetailModal({
  model,
  open,
  onOpenChange,
}: ModelDetailModalProps) {
  if (!model) return null;

  const statusColors = {
    online: 'success',
    offline: 'destructive',
    limited: 'warning',
  } as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{model.name}</DialogTitle>
            <Badge variant={statusColors[model.availability]}>
              {model.availability}
            </Badge>
          </div>
          {model.alias && (
            <DialogDescription className="text-base">
              Alias: {model.alias}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
              PROVIDER
            </h3>
            <p className="text-lg">{model.provider}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                CONTEXT LENGTH
              </h3>
              <p className="text-lg font-mono">
                {model.contextLength.toLocaleString()} tokens
              </p>
            </div>

            {model.vramRequired && (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                  VRAM REQUIRED
                </h3>
                <p className="text-lg font-mono">
                  {formatBytes(model.vramRequired * 1024 * 1024 * 1024)}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                COST PER 1K TOKENS
              </h3>
              <p className="text-lg font-mono">
                ${model.costPer1kTokens.toFixed(4)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                DISCOVERED
              </h3>
              <p className="text-sm">
                {new Date(model.discoveredAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
              CAPABILITIES
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50">
                <span className="text-sm">Streaming Support</span>
                {model.supportsStreaming ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50">
                <span className="text-sm">Tool Calling</span>
                {model.supportsTools ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          </div>

          {model.capabilities && model.capabilities.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                  ADDITIONAL CAPABILITIES
                </h3>
                <div className="flex flex-wrap gap-2">
                  {model.capabilities.map((capability) => (
                    <Badge key={capability} variant="secondary">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
