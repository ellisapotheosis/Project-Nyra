'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, PlayCircle, Sparkles } from 'lucide-react';
import type { RoutingRule } from './rule-builder';
import type { RoutingStrategy } from './strategy-selector';

interface RoutingSimulatorProps {
  strategy: RoutingStrategy;
  rules: RoutingRule[];
  preferLocalGPU: boolean;
  cloudFallback: boolean;
  costThreshold: number;
}

interface SimulationResult {
  input: string;
  matchedRule?: RoutingRule;
  selectedProvider: string;
  selectedModel: string;
  reasoning: string[];
  estimatedCost: number;
  estimatedLatency: number;
}

export function RoutingSimulator({
  strategy,
  rules,
  preferLocalGPU,
  cloudFallback,
  costThreshold,
}: RoutingSimulatorProps) {
  const [testInput, setTestInput] = useState('');
  const [result, setResult] = useState<SimulationResult | null>(null);

  const simulateRouting = () => {
    if (!testInput.trim()) {
      return;
    }

    const reasoning: string[] = [];
    let selectedProvider = 'openai';
    let selectedModel = 'gpt-4-turbo';
    let matchedRule: RoutingRule | undefined;

    // Step 1: Check for matching custom rules
    const enabledRules = rules
      .filter((r) => r.enabled)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of enabledRules) {
      const pattern = rule.pattern.replace('*', '.*');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(testInput)) {
        matchedRule = rule;
        selectedProvider = rule.targetProvider;
        selectedModel = rule.targetModel;
        reasoning.push(`Matched custom rule: "${rule.pattern}" (priority ${rule.priority})`);
        break;
      }
    }

    if (!matchedRule) {
      reasoning.push('No custom rule matched, applying strategy...');

      // Step 2: Apply strategy
      if (strategy === 'cost-optimized') {
        if (preferLocalGPU) {
          selectedProvider = 'local-gpu';
          selectedModel = 'mistral-7b';
          reasoning.push('Selected local GPU for cost optimization');
        } else {
          selectedProvider = 'anthropic';
          selectedModel = 'claude-3-haiku';
          reasoning.push('Selected cheaper cloud model (Claude 3 Haiku)');
        }
      } else if (strategy === 'latency-optimized') {
        if (preferLocalGPU) {
          selectedProvider = 'local-gpu';
          selectedModel = 'mistral-7b';
          reasoning.push('Selected local GPU for minimal latency');
        } else {
          selectedProvider = 'openai';
          selectedModel = 'gpt-3.5-turbo';
          reasoning.push('Selected fast cloud model (GPT-3.5 Turbo)');
        }
      } else if (strategy === 'quality-optimized') {
        selectedProvider = 'anthropic';
        selectedModel = 'claude-3-opus';
        reasoning.push('Selected highest quality model (Claude 3 Opus)');
      }
    }

    // Step 3: Apply preferences
    if (preferLocalGPU && selectedProvider !== 'local-gpu' && !matchedRule) {
      reasoning.push('Local GPU preferred but not available for this request');
    }

    if (cloudFallback) {
      reasoning.push('Cloud fallback enabled for reliability');
    }

    // Step 4: Cost check
    const estimatedCost = calculateCost(selectedProvider, selectedModel);
    if (estimatedCost > costThreshold) {
      reasoning.push(
        `⚠️ Cost ($${estimatedCost.toFixed(4)}) exceeds threshold ($${costThreshold.toFixed(2)})`
      );
    } else {
      reasoning.push(`✓ Cost within threshold`);
    }

    setResult({
      input: testInput,
      matchedRule,
      selectedProvider,
      selectedModel,
      reasoning,
      estimatedCost,
      estimatedLatency: calculateLatency(selectedProvider),
    });
  };

  const calculateCost = (provider: string, model: string): number => {
    const costs: Record<string, number> = {
      'local-gpu': 0.0,
      'gpt-3.5-turbo': 0.002,
      'gpt-4-turbo': 0.03,
      'claude-3-haiku': 0.0025,
      'claude-3-sonnet': 0.015,
      'claude-3-opus': 0.075,
      'gemini-pro': 0.00025,
    };
    return costs[model] || 0.01;
  };

  const calculateLatency = (provider: string): number => {
    const latencies: Record<string, number> = {
      'local-gpu': 50,
      openai: 200,
      anthropic: 250,
      google: 180,
      custom: 300,
    };
    return latencies[provider] || 200;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Routing Simulator</CardTitle>
        <CardDescription>
          Test how your routing configuration handles different requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="test-input">Test Request Path</Label>
            <Input
              id="test-input"
              placeholder="/v1/chat/completions"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && simulateRouting()}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={simulateRouting} className="gap-2">
              <PlayCircle className="h-4 w-4" />
              Simulate
            </Button>
          </div>
        </div>

        {/* Result Section */}
        {result && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold">Routing Decision</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{result.estimatedLatency}ms</Badge>
                <Badge variant="outline">${result.estimatedCost.toFixed(4)}</Badge>
              </div>
            </div>

            {/* Provider/Model Selection */}
            <div className="flex items-center gap-4 p-3 bg-background rounded-md">
              <div className="text-sm text-muted-foreground font-mono">{result.input}</div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge className="text-base">{result.selectedProvider}</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary" className="text-base">
                {result.selectedModel}
              </Badge>
            </div>

            {/* Reasoning */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Reasoning:</div>
              <ul className="space-y-1.5">
                {result.reasoning.map((reason, index) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-primary mt-0.5">{index + 1}.</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Matched Rule */}
            {result.matchedRule && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
                <div className="text-sm font-medium text-primary">Matched Custom Rule</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Pattern: <span className="font-mono">{result.matchedRule.pattern}</span> •
                  Priority: {result.matchedRule.priority}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Example Patterns */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Example patterns:</div>
          <div className="flex flex-wrap gap-2">
            {[
              '/v1/chat/completions',
              '/v1/embeddings',
              '/v1/images/generations',
              '/api/custom/endpoint',
            ].map((example) => (
              <Button
                key={example}
                variant="outline"
                size="sm"
                onClick={() => setTestInput(example)}
              >
                {example}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
