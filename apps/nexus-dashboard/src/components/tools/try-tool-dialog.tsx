'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tool } from '@/lib/store';
import { Zap, Copy, Loader2 } from 'lucide-react';

interface TryToolDialogProps {
  tool: Tool | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ToolParameter {
  [key: string]: string;
}

export function TryToolDialog({
  tool,
  open,
  onOpenChange,
}: TryToolDialogProps) {
  const [parameters, setParameters] = useState<ToolParameter>({});
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [callHistory, setCallHistory] = useState<Array<{ tool: string; params: ToolParameter; response: string; timestamp: Date }>>([]);

  if (!tool) return null;

  const handleParameterChange = (key: string, value: string) => {
    setParameters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleExecute = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockResponse = JSON.stringify(
        {
          status: 'success',
          toolName: tool.name,
          parametersReceived: parameters,
          result: {
            message: `Successfully executed ${tool.name}`,
            timestamp: new Date().toISOString(),
          },
        },
        null,
        2
      );

      setResponse(mockResponse);
      setCallHistory((prev) => [
        {
          tool: tool.name,
          params: parameters,
          response: mockResponse,
          timestamp: new Date(),
        },
        ...prev.slice(0, 9), // Keep last 10
      ]);
    } catch (error) {
      setResponse(JSON.stringify({ error: 'Failed to execute tool' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  const handleReset = () => {
    setParameters({});
    setResponse(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Try: {tool.name}
          </DialogTitle>
          <DialogDescription>{tool.description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-auto">
          <div className="space-y-6 pr-4">
            {/* Parameters Input */}
            <div className="space-y-4">
              <h3 className="font-semibold">Parameters</h3>
              {Object.keys(tool.parameters).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(tool.parameters).map(([key, type]) => (
                    <div key={key} className="space-y-1.5">
                      <Label htmlFor={key} className="text-sm">
                        {key}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({typeof type === 'string' ? type : 'string'})
                        </span>
                      </Label>
                      {typeof type === 'string' && type.includes('text') || type === 'description' ? (
                        <Textarea
                          id={key}
                          placeholder={`Enter ${key}...`}
                          value={parameters[key] || ''}
                          onChange={(e) => handleParameterChange(key, e.target.value)}
                          className="min-h-[100px]"
                        />
                      ) : (
                        <Input
                          id={key}
                          type="text"
                          placeholder={`Enter ${key}...`}
                          value={parameters[key] || ''}
                          onChange={(e) => handleParameterChange(key, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No parameters required for this tool.</p>
              )}
            </div>

            <Separator />

            {/* Response */}
            {response && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Response</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyResponse}
                  >
                    <Copy className={`h-3.5 w-3.5 ${copiedResponse ? 'text-green-500' : ''}`} />
                  </Button>
                </div>
                <div className="bg-muted/50 rounded p-3 font-mono text-xs overflow-x-auto max-h-[300px] overflow-y-auto whitespace-pre-wrap break-words">
                  {response}
                </div>
              </div>
            )}

            {/* Call History */}
            {callHistory.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Recent Calls</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {callHistory.map((call, index) => (
                      <div key={index} className="text-xs p-2 bg-muted/30 rounded border">
                        <div className="font-mono text-muted-foreground">
                          {call.timestamp.toLocaleTimeString()}
                        </div>
                        <div className="truncate text-foreground">
                          {JSON.stringify(call.params)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
          >
            Reset
          </Button>
          <Button
            onClick={handleExecute}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Execute
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
