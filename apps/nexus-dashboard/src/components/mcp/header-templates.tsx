'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Copy, Trash2, Save } from 'lucide-react';
import { Header } from './header-editor';

interface Template {
  id: string;
  name: string;
  description?: string;
  headers: Array<{ key: string; value: string }>;
  isCustom?: boolean;
}

interface HeaderTemplatesProps {
  onApplyTemplate: (headers: Array<{ key: string; value: string }>) => void;
  onTestHeaders: (headers: Header[]) => void;
  currentHeaders?: Header[];
}

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'auth-bearer',
    name: 'Bearer Token',
    description: 'Standard JWT authorization',
    headers: [
      { key: 'Authorization', value: 'Bearer ${API_KEY}' },
    ],
  },
  {
    id: 'api-key',
    name: 'API Key',
    description: 'Custom API key header',
    headers: [
      { key: 'X-API-Key', value: '${SERVICE_KEY}' },
    ],
  },
  {
    id: 'content-type-json',
    name: 'JSON Content',
    description: 'JSON request/response headers',
    headers: [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Accept', value: 'application/json' },
    ],
  },
  {
    id: 'cors-standard',
    name: 'CORS Headers',
    description: 'Standard CORS configuration',
    headers: [
      { key: 'Origin', value: 'http://localhost:3000' },
      { key: 'Access-Control-Request-Method', value: 'POST' },
    ],
  },
  {
    id: 'user-agent',
    name: 'User Agent',
    description: 'Custom user agent header',
    headers: [
      { key: 'User-Agent', value: 'Claude-MCP-Client/1.0' },
    ],
  },
];

export function HeaderTemplates({
  onApplyTemplate,
  onTestHeaders,
  currentHeaders,
}: HeaderTemplatesProps) {
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const saveCustomTemplate = () => {
    if (!customName.trim() || !currentHeaders || currentHeaders.length === 0) return;

    const newTemplate: Template = {
      id: `custom-${Date.now()}`,
      name: customName,
      description: customDesc,
      headers: currentHeaders.map((h) => ({ key: h.key, value: h.value })),
      isCustom: true,
    };

    setTemplates([...templates, newTemplate]);
    setCustomName('');
    setCustomDesc('');
    setIsDialogOpen(false);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  const handleTestHeaders = async () => {
    if (!currentHeaders || currentHeaders.length === 0) {
      setTestResult('No headers to test');
      return;
    }

    try {
      // Format headers for display
      const headerLines = currentHeaders
        .map((h) => `${h.key}: ${h.value}`)
        .join('\n');

      setTestResult(
        `Headers will be sent as:\n\n${headerLines}\n\nThese headers will be included in all requests to this MCP server.`
      );
    } catch (error) {
      setTestResult(`Error testing headers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Header Templates</CardTitle>
          <CardDescription>
            Quick-apply pre-configured header sets or save your current configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 max-h-64 overflow-y-auto">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-semibold text-sm">{template.name}</div>
                  {template.description && (
                    <div className="text-xs text-muted-foreground">{template.description}</div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {template.headers.length} header{template.headers.length !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onApplyTemplate(template.headers)}
                    className="text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Apply
                  </Button>

                  {template.isCustom && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTemplate(template.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2 border-t">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Current
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Header Template</DialogTitle>
                  <DialogDescription>
                    Save your current header configuration as a reusable template
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template-name" className="text-sm">
                      Template Name
                    </Label>
                    <Input
                      id="template-name"
                      placeholder="e.g., Production Auth Headers"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="template-desc" className="text-sm">
                      Description (optional)
                    </Label>
                    <Input
                      id="template-desc"
                      placeholder="e.g., Headers for production API authentication"
                      value={customDesc}
                      onChange={(e) => setCustomDesc(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="bg-muted p-3 rounded-lg max-h-40 overflow-y-auto">
                    <div className="text-xs font-semibold mb-2">Headers to save:</div>
                    <div className="space-y-1 text-xs font-mono">
                      {currentHeaders && currentHeaders.length > 0 ? (
                        currentHeaders.map((h) => (
                          <div key={h.id} className="text-muted-foreground">
                            <span className="text-primary">{h.key}</span>
                            <span className="text-muted-foreground">: </span>
                            <span>{h.value.substring(0, 50)}{h.value.length > 50 ? '...' : ''}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-muted-foreground">No headers configured</div>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveCustomTemplate}
                    disabled={!customName.trim() || !currentHeaders || currentHeaders.length === 0}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              className="flex-1"
              onClick={handleTestHeaders}
            >
              Test Headers
            </Button>
          </div>

          {testResult && (
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <div className="text-xs font-semibold mb-2 text-blue-400">Test Results</div>
              <div className="text-xs text-foreground whitespace-pre-wrap font-mono">
                {testResult}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
