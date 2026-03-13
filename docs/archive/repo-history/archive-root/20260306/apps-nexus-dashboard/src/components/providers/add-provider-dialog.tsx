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

interface AddProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (provider: Omit<AIProvider, 'id' | 'status' | 'lastHealthCheck'>) => void;
}

const PROVIDER_TYPES = [
  { value: 'anthropic', label: 'Anthropic', icon: '🔮' },
  { value: 'openai', label: 'OpenAI', icon: '🤖' },
  { value: 'google', label: 'Google', icon: '🔍' },
  { value: 'aws-bedrock', label: 'AWS Bedrock', icon: '☁️' },
  { value: 'openrouter', label: 'OpenRouter', icon: '🔀' },
  { value: 'meta', label: 'Meta', icon: '🦙' },
  { value: 'cohere', label: 'Cohere', icon: '💬' },
] as const;

export function AddProviderDialog({
  open,
  onOpenChange,
  onAdd,
}: AddProviderDialogProps) {
  const [selectedType, setSelectedType] = useState<typeof PROVIDER_TYPES[number]['value'] | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [tokenForwarding, setTokenForwarding] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleAdd = () => {
    if (!selectedType) return;

    const providerType = PROVIDER_TYPES.find(p => p.value === selectedType);
    if (!providerType) return;

    onAdd({
      name: providerType.label,
      type: selectedType,
      enabled: true,
      apiKey: apiKey || undefined,
      tokenForwarding,
    });

    // Reset form
    setSelectedType(null);
    setApiKey('');
    setTokenForwarding(false);
    setShowApiKey(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add AI Provider</DialogTitle>
          <DialogDescription>
            Select and configure a new AI provider to integrate with Nexus Router.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Provider</Label>
            <div className="grid grid-cols-2 gap-2">
              {PROVIDER_TYPES.map((provider) => (
                <button
                  key={provider.value}
                  type="button"
                  onClick={() => setSelectedType(provider.value)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    selectedType === provider.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-2xl">{provider.icon}</span>
                  <span className="text-sm font-medium">{provider.label}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedType && (
            <>
              <div className="space-y-2">
                <Label htmlFor="new-api-key">API Key</Label>
                <div className="relative">
                  <Input
                    id="new-api-key"
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
                  Optional: Add your API key now or configure it later.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="new-token-forwarding" className="text-base">
                    Token Forwarding
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Forward token usage metrics to the provider
                  </p>
                </div>
                <Switch
                  id="new-token-forwarding"
                  checked={tokenForwarding}
                  onCheckedChange={setTokenForwarding}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selectedType}>
            Add Provider
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
