'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';

export interface RoutingRule {
  id: string;
  pattern: string;
  targetProvider: string;
  targetModel: string;
  priority: number;
  enabled: boolean;
}

interface RuleBuilderProps {
  rules: RoutingRule[];
  onAddRule: (rule: Omit<RoutingRule, 'id'>) => void;
  onUpdateRule: (id: string, updates: Partial<RoutingRule>) => void;
  onDeleteRule: (id: string) => void;
}

const providers = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'google', name: 'Google' },
  { id: 'local-gpu', name: 'Local GPU' },
  { id: 'custom', name: 'Custom' },
];

const models = {
  openai: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  google: ['gemini-pro', 'gemini-ultra'],
  'local-gpu': ['llama-2-70b', 'mistral-7b', 'codellama-34b'],
  custom: ['custom-model-1', 'custom-model-2'],
};

export function RuleBuilder({ rules, onAddRule, onUpdateRule, onDeleteRule }: RuleBuilderProps) {
  const [newRule, setNewRule] = useState({
    pattern: '',
    targetProvider: 'openai',
    targetModel: 'gpt-4-turbo',
    priority: 10,
    enabled: true,
  });

  const handleAddRule = () => {
    if (!newRule.pattern.trim()) {
      return;
    }

    onAddRule(newRule);
    setNewRule({
      pattern: '',
      targetProvider: 'openai',
      targetModel: 'gpt-4-turbo',
      priority: 10,
      enabled: true,
    });
  };

  const availableModels = models[newRule.targetProvider as keyof typeof models] || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Routing Rules</CardTitle>
        <CardDescription>
          Define custom rules to route requests based on patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Rule Form */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg bg-muted/50">
          <div className="space-y-2">
            <Label htmlFor="pattern">Pattern</Label>
            <Input
              id="pattern"
              placeholder="/v1/chat/*"
              value={newRule.pattern}
              onChange={(e) => setNewRule({ ...newRule, pattern: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">Target Provider</Label>
            <Select
              value={newRule.targetProvider}
              onValueChange={(value) =>
                setNewRule({
                  ...newRule,
                  targetProvider: value,
                  targetModel: models[value as keyof typeof models][0],
                })
              }
            >
              <SelectTrigger id="provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Target Model</Label>
            <Select
              value={newRule.targetModel}
              onValueChange={(value) => setNewRule({ ...newRule, targetModel: value })}
            >
              <SelectTrigger id="model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Input
              id="priority"
              type="number"
              min="1"
              max="100"
              value={newRule.priority}
              onChange={(e) =>
                setNewRule({ ...newRule, priority: parseInt(e.target.value) || 10 })
              }
            />
          </div>

          <div className="flex items-end">
            <Button onClick={handleAddRule} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </div>

        {/* Rules Table */}
        {rules.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pattern</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="w-20">Priority</TableHead>
                <TableHead className="w-20">Status</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules
                .sort((a, b) => b.priority - a.priority)
                .map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-mono text-sm">{rule.pattern}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {providers.find((p) => p.id === rule.targetProvider)?.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {rule.targetModel}
                    </TableCell>
                    <TableCell>
                      <Badge>{rule.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(enabled) => onUpdateRule(rule.id, { enabled })}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No custom rules defined. Add your first rule above.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
