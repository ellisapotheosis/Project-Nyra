'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MCPProtocol, MCPAuthType, MCPServerConfig } from '@/lib/types/mcp';

interface ServerConfigFormProps {
  name: string;
  description: string;
  protocol: MCPProtocol;
  config: MCPServerConfig;
  enabled: boolean;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onProtocolChange: (protocol: MCPProtocol) => void;
  onConfigChange: (config: Partial<MCPServerConfig>) => void;
  onEnabledChange: (enabled: boolean) => void;
}

export function ServerConfigForm({
  name,
  description,
  protocol,
  config,
  enabled,
  onNameChange,
  onDescriptionChange,
  onProtocolChange,
  onConfigChange,
  onEnabledChange,
}: ServerConfigFormProps) {
  const [customHeaders, setCustomHeaders] = useState(
    JSON.stringify(config.customHeaders || {}, null, 2)
  );
  const [env, setEnv] = useState(
    JSON.stringify(config.env || {}, null, 2)
  );

  const handleCustomHeadersChange = (value: string) => {
    setCustomHeaders(value);
    try {
      const parsed = JSON.parse(value);
      onConfigChange({ customHeaders: parsed });
    } catch {
      // Invalid JSON, don't update
    }
  };

  const handleEnvChange = (value: string) => {
    setEnv(value);
    try {
      const parsed = JSON.parse(value);
      onConfigChange({ env: parsed });
    } catch {
      // Invalid JSON, don't update
    }
  };

  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="space-y-2">
        <Label htmlFor="name">Server Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="My MCP Server"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Optional description"
          rows={2}
        />
      </div>

      {/* Protocol Selection */}
      <div className="space-y-2">
        <Label htmlFor="protocol">Protocol *</Label>
        <Select value={protocol} onValueChange={(value) => onProtocolChange(value as MCPProtocol)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stdio">STDIO (Local Process)</SelectItem>
            <SelectItem value="sse">SSE (Server-Sent Events)</SelectItem>
            <SelectItem value="http">HTTP (REST API)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Protocol-specific Configuration */}
      {protocol === 'stdio' && (
        <div className="space-y-4 border-l-2 border-primary pl-4">
          <div className="space-y-2">
            <Label htmlFor="command">Command *</Label>
            <Input
              id="command"
              value={config.command || ''}
              onChange={(e) => onConfigChange({ command: e.target.value })}
              placeholder="npx"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="args">Arguments (space-separated)</Label>
            <Input
              id="args"
              value={config.args?.join(' ') || ''}
              onChange={(e) => onConfigChange({ args: e.target.value.split(' ').filter(Boolean) })}
              placeholder="-y @modelcontextprotocol/server-filesystem"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workingDir">Working Directory</Label>
            <Input
              id="workingDir"
              value={config.workingDir || ''}
              onChange={(e) => onConfigChange({ workingDir: e.target.value })}
              placeholder="/path/to/working/directory"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="env">Environment Variables (JSON)</Label>
            <Textarea
              id="env"
              value={env}
              onChange={(e) => handleEnvChange(e.target.value)}
              placeholder={'{\n  "NODE_ENV": "production"\n}'}
              rows={4}
              className="font-mono text-xs"
            />
          </div>
        </div>
      )}

      {protocol === 'sse' && (
        <div className="space-y-4 border-l-2 border-primary pl-4">
          <div className="space-y-2">
            <Label htmlFor="sseUrl">SSE URL *</Label>
            <Input
              id="sseUrl"
              type="url"
              value={config.sseUrl || ''}
              onChange={(e) => onConfigChange({ sseUrl: e.target.value })}
              placeholder="https://example.com/sse"
            />
          </div>
        </div>
      )}

      {protocol === 'http' && (
        <div className="space-y-4 border-l-2 border-primary pl-4">
          <div className="space-y-2">
            <Label htmlFor="httpUrl">HTTP Base URL *</Label>
            <Input
              id="httpUrl"
              type="url"
              value={config.httpUrl || ''}
              onChange={(e) => onConfigChange({ httpUrl: e.target.value })}
              placeholder="https://api.example.com"
            />
          </div>
        </div>
      )}

      {/* Authentication */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-semibold">Authentication</h3>

        <div className="space-y-2">
          <Label htmlFor="authType">Auth Type</Label>
          <Select
            value={config.authType}
            onValueChange={(value) => onConfigChange({ authType: value as MCPAuthType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="bearer">Bearer Token</SelectItem>
              <SelectItem value="basic">Basic Auth</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {config.authType === 'bearer' && (
          <div className="space-y-2">
            <Label htmlFor="bearerToken">Bearer Token *</Label>
            <Input
              id="bearerToken"
              type="password"
              value={config.bearerToken || ''}
              onChange={(e) => onConfigChange({ bearerToken: e.target.value })}
              placeholder="your-bearer-token"
            />
          </div>
        )}

        {config.authType === 'basic' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="basicUsername">Username *</Label>
              <Input
                id="basicUsername"
                value={config.basicUsername || ''}
                onChange={(e) => onConfigChange({ basicUsername: e.target.value })}
                placeholder="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="basicPassword">Password *</Label>
              <Input
                id="basicPassword"
                type="password"
                value={config.basicPassword || ''}
                onChange={(e) => onConfigChange({ basicPassword: e.target.value })}
                placeholder="password"
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="customHeaders">Custom Headers (JSON)</Label>
          <Textarea
            id="customHeaders"
            value={customHeaders}
            onChange={(e) => handleCustomHeadersChange(e.target.value)}
            placeholder={'{\n  "X-API-Key": "value"\n}'}
            rows={4}
            className="font-mono text-xs"
          />
        </div>
      </div>

      {/* Enable/Disable */}
      <div className="flex items-center space-x-2 pt-4 border-t">
        <Switch
          id="enabled"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
        <Label htmlFor="enabled">Enable server on save</Label>
      </div>
    </div>
  );
}
