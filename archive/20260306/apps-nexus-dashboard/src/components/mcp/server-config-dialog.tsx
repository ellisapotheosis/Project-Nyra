'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeaderEditor, Header } from './header-editor';
import { HeaderTemplates } from './header-templates';
import { MCPServer } from '@/lib/store';
import { Settings } from 'lucide-react';

interface ServerConfigDialogProps {
  server: MCPServer;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (headers: Header[]) => void;
}

// Mock environment variables - in production, these would come from API
const MOCK_ENV_VARS = ['API_KEY', 'SERVICE_KEY', 'AUTH_TOKEN', 'CLIENT_ID'];

export function ServerConfigDialog({
  server,
  open = false,
  onOpenChange,
  onSave,
}: ServerConfigDialogProps) {
  const [isOpen, setIsOpen] = useState(open);
  const [headers, setHeaders] = useState<Header[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onSave?.(headers);
      setTimeout(() => {
        setIsSaving(false);
        handleOpenChange(false);
      }, 500);
    } catch (error) {
      console.error('Failed to save headers:', error);
      setIsSaving(false);
    }
  };

  const handleApplyTemplate = (templateHeaders: Array<{ key: string; value: string }>) => {
    const newHeaders = templateHeaders.map((h) => ({
      id: `header-${Date.now()}-${Math.random()}`,
      key: h.key,
      value: h.value,
    }));
    setHeaders([...headers, ...newHeaders]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure MCP Server: {server.name}
          </DialogTitle>
          <DialogDescription>
            Manage HTTP headers and request configuration for this server
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="headers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="headers" className="space-y-4 mt-4">
            <HeaderEditor
              headers={headers}
              onHeadersChange={setHeaders}
              environmentVars={MOCK_ENV_VARS}
            />
          </TabsContent>

          <TabsContent value="templates" className="space-y-4 mt-4">
            <HeaderTemplates
              onApplyTemplate={handleApplyTemplate}
              onTestHeaders={(testHeaders) => {
                console.log('Test headers:', testHeaders);
              }}
              currentHeaders={headers}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
