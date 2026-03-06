'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ModelFiltersProps {
  selectedProviders: string[];
  onProviderChange: (providers: string[]) => void;
  streamingFilter: boolean | null;
  onStreamingChange: (value: boolean | null) => void;
  toolsFilter: boolean | null;
  onToolsChange: (value: boolean | null) => void;
  availableProviders: string[];
}

export function ModelFilters({
  selectedProviders,
  onProviderChange,
  streamingFilter,
  onStreamingChange,
  toolsFilter,
  onToolsChange,
  availableProviders,
}: ModelFiltersProps) {
  const handleProviderToggle = (provider: string) => {
    if (selectedProviders.includes(provider)) {
      onProviderChange(selectedProviders.filter((p) => p !== provider));
    } else {
      onProviderChange([...selectedProviders, provider]);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Providers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {availableProviders.map((provider) => (
            <div key={provider} className="flex items-center space-x-2">
              <Checkbox
                id={`provider-${provider}`}
                checked={selectedProviders.includes(provider)}
                onCheckedChange={() => handleProviderToggle(provider)}
              />
              <Label
                htmlFor={`provider-${provider}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {provider}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Capabilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="streaming"
              checked={streamingFilter === true}
              onCheckedChange={(checked) =>
                onStreamingChange(checked ? true : null)
              }
            />
            <Label
              htmlFor="streaming"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Streaming Support
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="tools"
              checked={toolsFilter === true}
              onCheckedChange={(checked) =>
                onToolsChange(checked ? true : null)
              }
            />
            <Label
              htmlFor="tools"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Tool Calling
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
