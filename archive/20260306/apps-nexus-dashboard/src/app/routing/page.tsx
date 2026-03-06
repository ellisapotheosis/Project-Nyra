'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Save, RefreshCw } from 'lucide-react';
import {
  StrategySelector,
  type RoutingStrategy,
} from '@/components/routing/strategy-selector';
import { RuleBuilder, type RoutingRule } from '@/components/routing/rule-builder';
import { RoutingSimulator } from '@/components/routing/routing-simulator';

export default function RoutingPage() {
  const [strategy, setStrategy] = useState<RoutingStrategy>('cost-optimized');
  const [preferLocalGPU, setPreferLocalGPU] = useState(true);
  const [cloudFallback, setCloudFallback] = useState(true);
  const [costThreshold, setCostThreshold] = useState([0.5]);
  const [rules, setRules] = useState<RoutingRule[]>([
    {
      id: '1',
      pattern: '/v1/chat/*',
      targetProvider: 'openai',
      targetModel: 'gpt-4-turbo',
      priority: 10,
      enabled: true,
    },
    {
      id: '2',
      pattern: '/v1/embeddings',
      targetProvider: 'local-gpu',
      targetModel: 'mistral-7b',
      priority: 8,
      enabled: true,
    },
  ]);

  const handleAddRule = (rule: Omit<RoutingRule, 'id'>) => {
    const newRule: RoutingRule = {
      ...rule,
      id: Date.now().toString(),
    };
    setRules([...rules, newRule]);
  };

  const handleUpdateRule = (id: string, updates: Partial<RoutingRule>) => {
    setRules(rules.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule)));
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id));
  };

  const handleSave = () => {
    console.log('Saving configuration:', {
      strategy,
      preferLocalGPU,
      cloudFallback,
      costThreshold: costThreshold[0],
      rules,
    });
    // TODO: Implement API call to save configuration
  };

  const handleReset = () => {
    setStrategy('cost-optimized');
    setPreferLocalGPU(true);
    setCloudFallback(true);
    setCostThreshold([0.5]);
    setRules([]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Routing Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Configure intelligent request routing strategies and rules
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Strategy Selection */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Routing Strategy</h2>
          <p className="text-sm text-muted-foreground">
            Select the primary optimization strategy for request routing
          </p>
        </div>
        <StrategySelector selectedStrategy={strategy} onStrategyChange={setStrategy} />
      </section>

      <Separator />

      {/* Global Settings */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Global Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure global routing preferences and thresholds
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Toggle Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Enable or disable routing preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="prefer-gpu" className="text-base">
                    Prefer Local GPU Workers
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Route to local GPU when available
                  </p>
                </div>
                <Switch
                  id="prefer-gpu"
                  checked={preferLocalGPU}
                  onCheckedChange={setPreferLocalGPU}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cloud-fallback" className="text-base">
                    Cloud Fallback Enabled
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Fallback to cloud when local fails
                  </p>
                </div>
                <Switch
                  id="cloud-fallback"
                  checked={cloudFallback}
                  onCheckedChange={setCloudFallback}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cost Threshold */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Threshold</CardTitle>
              <CardDescription>
                Maximum cost per request (in USD per 1K tokens)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Threshold Value</Label>
                  <span className="text-2xl font-bold">${costThreshold[0].toFixed(2)}</span>
                </div>
                <Slider
                  value={costThreshold}
                  onValueChange={setCostThreshold}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$0.00</span>
                  <span>$0.50</span>
                  <span>$1.00</span>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  Requests exceeding this cost will trigger a warning and may be routed to
                  cheaper alternatives based on your strategy.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Custom Rules */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Custom Routing Rules</h2>
          <p className="text-sm text-muted-foreground">
            Define pattern-based rules that override the default strategy
          </p>
        </div>
        <RuleBuilder
          rules={rules}
          onAddRule={handleAddRule}
          onUpdateRule={handleUpdateRule}
          onDeleteRule={handleDeleteRule}
        />
      </section>

      <Separator />

      {/* Simulator */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Test Your Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Simulate routing decisions to validate your configuration
          </p>
        </div>
        <RoutingSimulator
          strategy={strategy}
          rules={rules}
          preferLocalGPU={preferLocalGPU}
          cloudFallback={cloudFallback}
          costThreshold={costThreshold[0]}
        />
      </section>
    </div>
  );
}
