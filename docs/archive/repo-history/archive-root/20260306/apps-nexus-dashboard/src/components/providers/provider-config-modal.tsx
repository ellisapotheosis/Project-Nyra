'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff } from 'lucide-react';
import { AIProvider } from '@/lib/store';

interface ProviderConfigModalProps {
  provider: AIProvider | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: Partial<AIProvider>) => void;
}

export function ProviderConfigModal({
  provider,
  open,
  onOpenChange,
  onSave,
}: ProviderConfigModalProps) {
  const [apiKey, setApiKey] = useState(provider?.apiKey || '');
  const [tokenForwarding, setTokenForwarding] = useState(provider?.tokenForwarding || false);
  const [showApiKey, setShowApiKey] = useState(false);

  if (!provider) return null;

  const handleSave = () => {
    onSave({
      apiKey: apiKey || undefined,
      tokenForwarding,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure {provider.name}</DialogTitle>
          <DialogDescription>
            Manage API credentials and settings for this provider.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="provider-type">Provider Type</Label>
            <Input
              id="provider-type"
              value={provider.type}
              disabled
              className="capitalize"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your API key will be stored securely and used for authentication.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="token-forwarding" className="text-base">
                Token Forwarding
              </Label>
              <p className="text-sm text-muted-foreground">
                Forward token usage metrics to the provider
              </p>
            </div>
            <Switch
              id="token-forwarding"
              checked={tokenForwarding}
              onCheckedChange={setTokenForwarding}
            />
          </div>

          <div className="rounded-lg bg-muted/50 p-3">
            <h4 className="text-sm font-medium mb-2">Provider Information</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-medium capitalize">{provider.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Enabled:</span>
                <span className="font-medium">{provider.enabled ? 'Yes' : 'No'}</span>
              </div>
              {provider.lastHealthCheck && (
                <div className="flex justify-between">
                  <span>Last Health Check:</span>
                  <span className="font-medium">
                    {new Date(provider.lastHealthCheck).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
