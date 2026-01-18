'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, ChevronRight } from 'lucide-react';
import { Tool } from '@/lib/store';
import { cn } from '@/lib/utils';

interface ToolCardProps {
  tool: Tool;
  onViewDetails?: (tool: Tool) => void;
  onTryTool?: (tool: Tool) => void;
  usageCount?: number;
  className?: string;
}

export function ToolCard({
  tool,
  onViewDetails,
  onTryTool,
  usageCount = 0,
  className,
}: ToolCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const paramCount = Object.keys(tool.parameters).length;

  return (
    <Card
      className={cn(
        'transition-all duration-200 cursor-pointer hover:shadow-lg',
        isHovered && 'border-primary/50',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails?.(tool)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{tool.name}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {tool.description}
            </CardDescription>
          </div>
          {isHovered && (
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {tool.category}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {tool.server}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-muted/50 rounded px-2 py-1.5">
            <div className="text-muted-foreground">Parameters</div>
            <div className="font-semibold">{paramCount}</div>
          </div>
          <div className="bg-muted/50 rounded px-2 py-1.5">
            <div className="text-muted-foreground">Usage</div>
            <div className="font-semibold">{usageCount}</div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(tool);
            }}
          >
            Details
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onTryTool?.(tool);
            }}
          >
            <Zap className="h-3.5 w-3.5 mr-1" />
            Try
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
