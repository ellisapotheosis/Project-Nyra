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
import { ServerConfigForm } from './server-config-form';
import { EnhancedMCPServer, MCPProtocol, MCPServerConfig } from '@/lib/types/mcp';
import { Loader2 } from 'lucide-react';

interface AddServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (server: Omit<EnhancedMCPServer, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'toolsCount' | 'latency' | 'lastCheck'>) => Promise<void>;
  editingServer?: EnhancedMCPServer;
}

export function AddServerDialog({
  open,
  onOpenChange,
  onSave,
  editingServer,
}: AddServerDialogProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(editingServer?.name || '');
  const [description, setDescription] = useState(editingServer?.description || '');
  const [protocol, setProtocol] = useState<MCPProtocol>(editingServer?.protocol || 'stdio');
  const [enabled, setEnabled] = useState(editingServer?.enabled ?? true);
  const [config, setConfig] = useState<MCPServerConfig>(
    editingServer?.config || {
      protocol: 'stdio',
      authType: 'none',
      command: '',
      args: [],
    }
  );

  const handleConfigChange = (updates: Partial<MCPServerConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...updates,
      protocol,
    }));
  };

  const handleProtocolChange = (newProtocol: MCPProtocol) => {
    setProtocol(newProtocol);
    // Reset protocol-specific fields
    const baseConfig: MCPServerConfig = {
      protocol: newProtocol,
      authType: config.authType,
      bearerToken: config.bearerToken,
      basicUsername: config.basicUsername,
      basicPassword: config.basicPassword,
      customHeaders: config.customHeaders,
    };

    if (newProtocol === 'stdio') {
      baseConfig.command = '';
      baseConfig.args = [];
    } else if (newProtocol === 'sse') {
      baseConfig.sseUrl = '';
    } else if (newProtocol === 'http') {
      baseConfig.httpUrl = '';
    }

    setConfig(baseConfig);
  };

  const validateForm = (): boolean => {
    if (!name.trim()) return false;

    if (protocol === 'stdio' && !config.command?.trim()) return false;
    if (protocol === 'sse' && !config.sseUrl?.trim()) return false;
    if (protocol === 'http' && !config.httpUrl?.trim()) return false;

    if (config.authType === 'bearer' && !config.bearerToken?.trim()) return false;
    if (config.authType === 'basic' && (!config.basicUsername?.trim() || !config.basicPassword?.trim())) return false;

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await onSave({
        name,
        description,
        protocol,
        config,
        enabled,
      });
      onOpenChange(false);
      // Reset form
      setName('');
      setDescription('');
      setProtocol('stdio');
      setEnabled(true);
      setConfig({
        protocol: 'stdio',
        authType: 'none',
        command: '',
        args: [],
      });
    } catch (error) {
      console.error('Failed to save server:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingServer ? 'Edit MCP Server' : 'Add MCP Server'}
          </DialogTitle>
          <DialogDescription>
            Configure a new MCP server connection. Choose the protocol and provide the necessary authentication details.
          </DialogDescription>
        </DialogHeader>

        <ServerConfigForm
          name={name}
          description={description}
          protocol={protocol}
          config={config}
          enabled={enabled}
          onNameChange={setName}
          onDescriptionChange={setDescription}
          onProtocolChange={handleProtocolChange}
          onConfigChange={handleConfigChange}
          onEnabledChange={setEnabled}
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!validateForm() || saving}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editingServer ? 'Save Changes' : 'Add Server'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
