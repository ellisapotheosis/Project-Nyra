'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DollarSign, Zap, Star } from 'lucide-react';

export type RoutingStrategy = 'cost-optimized' | 'latency-optimized' | 'quality-optimized';

interface StrategySelectorProps {
  selectedStrategy: RoutingStrategy;
  onStrategyChange: (strategy: RoutingStrategy) => void;
}

const strategies = [
  {
    id: 'cost-optimized' as const,
    title: 'Cost-Optimized',
    description: 'Minimize costs by routing to cheaper providers and models',
    icon: DollarSign,
    color: 'text-green-500',
    benefits: [
      'Routes to lowest cost providers',
      'Prefers smaller, cheaper models',
      'Automatic cost tracking',
    ],
  },
  {
    id: 'latency-optimized' as const,
    title: 'Latency-Optimized',
    description: 'Prioritize response speed and reduce waiting times',
    icon: Zap,
    color: 'text-yellow-500',
    benefits: [
      'Routes to fastest providers',
      'Prefers local GPU workers',
      'Minimizes network hops',
    ],
  },
  {
    id: 'quality-optimized' as const,
    title: 'Quality-Optimized',
    description: 'Focus on response quality and accuracy',
    icon: Star,
    color: 'text-purple-500',
    benefits: [
      'Routes to highest quality models',
      'Prefers latest model versions',
      'Optimizes for accuracy',
    ],
  },
];

export function StrategySelector({ selectedStrategy, onStrategyChange }: StrategySelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {strategies.map((strategy) => {
        const Icon = strategy.icon;
        const isSelected = selectedStrategy === strategy.id;

        return (
          <Card
            key={strategy.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-lg',
              isSelected && 'ring-2 ring-primary'
            )}
            onClick={() => onStrategyChange(strategy.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <Icon className={cn('h-6 w-6', strategy.color)} />
                {isSelected && <Badge>Active</Badge>}
              </div>
              <CardTitle className="mt-4">{strategy.title}</CardTitle>
              <CardDescription>{strategy.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {strategy.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
