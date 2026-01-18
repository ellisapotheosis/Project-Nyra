'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ConfigEditor } from '@/components/config/config-editor';
import { ConfigDiffViewer } from '@/components/config/config-diff-viewer';
import { Save, Download, Upload, Copy, RotateCcw, Archive, RotateCw, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Default TOML configuration
const DEFAULT_CONFIG = `# Nexus Router Configuration
# Generated: ${new Date().toISOString()}

[server]
name = "Nexus Router"
host = "0.0.0.0"
port = 8000
workers = 4

[api]
base_url = "http://localhost:8000"
rate_limit = 60
enable_rate_limiting = true
timeout_seconds = 30

[performance]
enable_caching = true
cache_ttl = 300
enable_batching = true
max_concurrent_requests = 100

[advanced]
debug_logging = false
enable_telemetry = true
websocket_reconnect_ms = 5000
health_check_interval = 30

[database]
engine = "postgresql"
host = "\${DB_HOST:localhost}"
port = 5432
username = "\${DB_USER:postgres}"

[models]
default_model = "gpt-4-turbo"
fallback_model = "gpt-3.5-turbo"
`;

interface ConfigState {
  current: string;
  previous: string;
  backups: Array<{ timestamp: string; content: string }>;
}

interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

export default function ConfigPage() {
  const [configState, setConfigState] = useState<ConfigState>({
    current: DEFAULT_CONFIG,
    previous: DEFAULT_CONFIG,
    backups: [],
  });

  const [activeTab, setActiveTab] = useState('form');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields state
  const [formData, setFormData] = useState({
    routerName: 'Nexus Router',
    defaultModel: 'gpt-4-turbo',
    apiUrl: 'http://localhost:8000',
    autoRefresh: true,
    darkMode: false,
    enableRateLimiting: true,
    rateLimit: '60',
    enableCaching: true,
    cacheTTL: '300',
    enableBatching: true,
    maxConcurrent: '100',
    debugLogging: false,
    enableTelemetry: true,
    websocketInterval: '5000',
    healthCheckInterval: '30',
  });

  // Load configuration from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('nexus-config');
    if (savedConfig) {
      setConfigState((prev) => ({
        ...prev,
        current: savedConfig,
      }));
    }
  }, []);

  const errorCount = validationErrors.filter((e) => e.severity === 'error').length;
  const hasValidationErrors = errorCount > 0;

  const handleConfigChange = (value: string) => {
    setConfigState((prev) => ({
      ...prev,
      current: value,
    }));
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateConfigFromForm = (): string => {
    return `# Nexus Router Configuration
# Last modified: ${new Date().toISOString()}

[server]
name = "${formData.routerName}"
host = "0.0.0.0"
port = 8000
workers = 4

[api]
base_url = "${formData.apiUrl}"
rate_limit = ${formData.rateLimit}
enable_rate_limiting = ${formData.enableRateLimiting}
timeout_seconds = 30

[performance]
enable_caching = ${formData.enableCaching}
cache_ttl = ${formData.cacheTTL}
enable_batching = ${formData.enableBatching}
max_concurrent_requests = ${formData.maxConcurrent}

[advanced]
debug_logging = ${formData.debugLogging}
enable_telemetry = ${formData.enableTelemetry}
websocket_reconnect_ms = ${formData.websocketInterval}
health_check_interval = ${formData.healthCheckInterval}

[database]
engine = "postgresql"
host = "\${DB_HOST:localhost}"
port = 5432
username = "\${DB_USER:postgres}"

[models]
default_model = "${formData.defaultModel}"
fallback_model = "gpt-3.5-turbo"
`;
  };

  const handleSave = async () => {
    if (hasValidationErrors) {
      setSaveStatus('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setSaveStatus('saving');
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Save to localStorage
      localStorage.setItem('nexus-config', configState.current);

      setConfigState((prev) => ({
        ...prev,
        previous: prev.current,
      }));

      setSaveStatus('success');
      setShowToast(true);
      setTimeout(() => {
        setSaveStatus('idle');
        setShowToast(false);
      }, 2000);
    } catch (error) {
      setSaveStatus('error');
      setShowToast(true);
      setTimeout(() => {
        setSaveStatus('idle');
        setShowToast(false);
      }, 2000);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setConfigState((prev) => ({
        ...prev,
        current: content,
      }));
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      `data:text/plain;charset=utf-8,${encodeURIComponent(configState.current)}`
    );
    element.setAttribute('download', `nexus-config-${Date.now()}.toml`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleBackup = () => {
    setConfigState((prev) => ({
      ...prev,
      backups: [
        {
          timestamp: new Date().toISOString(),
          content: prev.current,
        },
        ...prev.backups.slice(0, 4), // Keep last 5 backups
      ],
    }));
    setSaveStatus('success');
    setShowToast(true);
    setTimeout(() => {
      setSaveStatus('idle');
      setShowToast(false);
    }, 2000);
  };

  const handleRestoreBackup = (index: number) => {
    setConfigState((prev) => ({
      ...prev,
      current: prev.backups[index].content,
    }));
  };

  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to reset to default configuration?')) {
      setConfigState((prev) => ({
        ...prev,
        current: DEFAULT_CONFIG,
        previous: prev.current,
      }));
    }
  };

  const handleRestorePrevious = () => {
    setConfigState((prev) => ({
      ...prev,
      current: prev.previous,
    }));
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(configState.current);
    setSaveStatus('success');
    setShowToast(true);
    setTimeout(() => {
      setSaveStatus('idle');
      setShowToast(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Manage Nexus Router settings, TOML configuration, and backups
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".toml,.txt"
            onChange={handleImport}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={handleBackup}
          >
            <Archive className="h-4 w-4 mr-2" />
            Backup
          </Button>
          <Button
            onClick={handleSave}
            disabled={hasValidationErrors || saveStatus === 'saving'}
            className={cn(
              saveStatus === 'success' &&
                'bg-green-600 hover:bg-green-700'
            )}
          >
            {saveStatus === 'saving' ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : saveStatus === 'success' ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className={cn(
          'p-4 rounded-md border animate-in fade-in slide-in-from-top-2',
          saveStatus === 'success'
            ? 'bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
        )}>
          <div className="flex items-center gap-2">
            {saveStatus === 'success' ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span>
              {saveStatus === 'success'
                ? 'Configuration saved successfully'
                : 'Please fix validation errors before saving'}
            </span>
          </div>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="form">Settings</TabsTrigger>
          <TabsTrigger value="editor">TOML Editor</TabsTrigger>
          <TabsTrigger value="diff">Diff Viewer</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="form" className="space-y-4">
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="api">API Settings</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Configure basic router settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Router Name</label>
                    <Input
                      value={formData.routerName}
                      onChange={(e) => handleFormChange('routerName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Model</label>
                    <Input
                      value={formData.defaultModel}
                      onChange={(e) => handleFormChange('defaultModel', e.target.value)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auto-refresh Dashboard</div>
                      <div className="text-sm text-muted-foreground">
                        Automatically refresh metrics every 30 seconds
                      </div>
                    </div>
                    <Switch
                      checked={formData.autoRefresh}
                      onCheckedChange={(checked) =>
                        handleFormChange('autoRefresh', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Dark Mode</div>
                      <div className="text-sm text-muted-foreground">
                        Enable dark theme for the dashboard
                      </div>
                    </div>
                    <Switch
                      checked={formData.darkMode}
                      onCheckedChange={(checked) =>
                        handleFormChange('darkMode', checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                  <CardDescription>
                    Configure API endpoints and authentication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Base URL</label>
                    <Input
                      value={formData.apiUrl}
                      onChange={(e) => handleFormChange('apiUrl', e.target.value)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Enable API Rate Limiting</div>
                      <div className="text-sm text-muted-foreground">
                        Limit requests per client to prevent abuse
                      </div>
                    </div>
                    <Switch
                      checked={formData.enableRateLimiting}
                      onCheckedChange={(checked) =>
                        handleFormChange('enableRateLimiting', checked)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Rate Limit (requests/minute)
                    </label>
                    <Input
                      type="number"
                      value={formData.rateLimit}
                      onChange={(e) => handleFormChange('rateLimit', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Settings</CardTitle>
                  <CardDescription>
                    Optimize router performance and caching
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Enable Response Caching</div>
                      <div className="text-sm text-muted-foreground">
                        Cache responses to reduce latency for repeated requests
                      </div>
                    </div>
                    <Switch
                      checked={formData.enableCaching}
                      onCheckedChange={(checked) =>
                        handleFormChange('enableCaching', checked)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cache TTL (seconds)</label>
                    <Input
                      type="number"
                      value={formData.cacheTTL}
                      onChange={(e) => handleFormChange('cacheTTL', e.target.value)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Enable Request Batching</div>
                      <div className="text-sm text-muted-foreground">
                        Batch multiple requests to improve throughput
                      </div>
                    </div>
                    <Switch
                      checked={formData.enableBatching}
                      onCheckedChange={(checked) =>
                        handleFormChange('enableBatching', checked)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Max Concurrent Requests
                    </label>
                    <Input
                      type="number"
                      value={formData.maxConcurrent}
                      onChange={(e) => handleFormChange('maxConcurrent', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Settings</CardTitle>
                  <CardDescription>Advanced configuration options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Enable Debug Logging</div>
                      <div className="text-sm text-muted-foreground">
                        Log detailed debug information (may impact performance)
                      </div>
                    </div>
                    <Switch
                      checked={formData.debugLogging}
                      onCheckedChange={(checked) =>
                        handleFormChange('debugLogging', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Enable Telemetry</div>
                      <div className="text-sm text-muted-foreground">
                        Send anonymous usage data to improve the platform
                      </div>
                    </div>
                    <Switch
                      checked={formData.enableTelemetry}
                      onCheckedChange={(checked) =>
                        handleFormChange('enableTelemetry', checked)
                      }
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      WebSocket Reconnect Interval (ms)
                    </label>
                    <Input
                      type="number"
                      value={formData.websocketInterval}
                      onChange={(e) =>
                        handleFormChange('websocketInterval', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Health Check Interval (seconds)
                    </label>
                    <Input
                      type="number"
                      value={formData.healthCheckInterval}
                      onChange={(e) =>
                        handleFormChange('healthCheckInterval', e.target.value)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action buttons for form */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const generated = generateConfigFromForm();
                setConfigState((prev) => ({
                  ...prev,
                  current: generated,
                }));
                setActiveTab('editor');
              }}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Sync to Editor
            </Button>
            <Button
              variant="outline"
              onClick={handleResetToDefaults}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
        </TabsContent>

        {/* TOML Editor Tab */}
        <TabsContent value="editor">
          <ConfigEditor
            initialValue={configState.current}
            onChange={handleConfigChange}
            onValidationChange={setValidationErrors}
            title="TOML Configuration Editor"
            description="Edit your configuration with real-time syntax validation and environment variable substitution"
          />
        </TabsContent>

        {/* Diff Viewer Tab */}
        <TabsContent value="diff">
          <ConfigDiffViewer
            current={configState.current}
            previous={configState.previous}
            onRestore={handleRestorePrevious}
            onApply={() => setActiveTab('editor')}
            title="Configuration Diff"
            description="Compare current configuration with the previously saved version"
          />
        </TabsContent>

        {/* Backups Tab */}
        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Backups</CardTitle>
              <CardDescription>
                Manage and restore configuration backups (up to 5 stored)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {configState.backups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No backups yet. Create one by clicking the Backup button above.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {configState.backups.map((backup, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <div className="font-medium">
                          Backup {index + 1}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(backup.timestamp).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {backup.content.split('\n').length} lines
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreBackup(index)}
                          className="gap-2"
                        >
                          <RotateCw className="h-4 w-4" />
                          Restore
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigator.clipboard.writeText(backup.content)
                          }
                          className="gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
