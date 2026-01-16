// TypeScript types for bootstrap manifest.json

export type PCRole = 'orchestrator' | 'worker';

export interface ConfigFile {
  source: string;
  target: string;
  checksum?: string;
}

export interface Component {
  enabled: boolean;
  displayName: string;
  description: string;
  files: ConfigFile[];
}

export interface PCFeatures {
  wsl_required: boolean;
  gpu_required: boolean;
  wol_enabled?: boolean;
  disconnectable?: boolean;
  gitea_optional?: boolean;
}

export interface PCDeployment {
  enabled: boolean;
  displayName: string;
  role: PCRole;
  description: string;
  components: Record<string, Component>;
  features: PCFeatures;
}

export interface GlobalSettings {
  backup_enabled: boolean;
  dry_run_default: boolean;
  log_level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  parallel_deployment: boolean;
}

export interface BootstrapManifest {
  version: string;
  created: string;
  description: string;
  deployments: Record<string, PCDeployment>;
  global_settings: GlobalSettings;
  installation_order: string[];
}

// PC identifiers
export type PCId = 'orchestrator-mini' | 'worker-rtx3090ti' | 'worker-rtx3060' | 'worker-rtx5090';

// Component identifiers
export type ComponentId =
  | 'claude-code'
  | 'claude-desktop'
  | 'claude-flow'
  | 'wsl-setup'
  | 'gitea'
  | 'docker'
  | 'infisical'
  | 'nvidia';

// Installation phases
export type InstallPhase =
  | 'selection'
  | 'environment'
  | 'components'
  | 'mcp-servers'
  | 'docker'
  | 'cloudflare-tunnels'
  | 'configuration'
  | 'shims'
  | 'deployment'
  | 'health-check'
  | 'complete'
  | 'error';

// Log entry
export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  component?: string;
  details?: string;
}

// Installation state
export interface InstallState {
  selectedPC: PCId | null;
  enabledComponents: Set<ComponentId>;
  currentPhase: InstallPhase;
  currentStep: number;
  totalSteps: number;
  progress: number;
  logs: LogEntry[];
  errors: Error[];
  isInstalling: boolean;
  canRollback: boolean;
}

// PC Status
export interface PCStatus {
  id: PCId;
  online: boolean;
  canWakeOnLAN: boolean;
  ipAddress?: string;
}

// Component validation result
export interface ValidationResult {
  component: ComponentId;
  valid: boolean;
  message: string;
  details?: string;
}

// Docker types
export type DockerContainerStatus = 'running' | 'stopped' | 'paused' | 'restarting' | 'unknown';

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: DockerContainerStatus;
  ports: string[];
  created: Date;
  health?: 'healthy' | 'unhealthy' | 'starting';
}

export interface DockerService {
  name: string;
  displayName: string;
  description: string;
  containers: DockerContainer[];
  required: boolean;
}

// MCP Server types
export interface MCPServer {
  id: string;
  name: string;
  displayName: string;
  description: string;
  enabled: boolean;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  status: 'active' | 'inactive' | 'error';
}

// Shim types
export interface ShimConfig {
  name: string;
  targetPath: string;
  shimPath: string;
  arguments?: string[];
  environment?: Record<string, string>;
}

// Environment types
export type EnvironmentType = 'development' | 'production' | 'pc1' | 'pc2' | 'pc3' | 'pc4';

export interface EnvironmentConfig {
  type: EnvironmentType;
  apiEndpoint: string;
  mcpServers: string[];
  dockerServices: string[];
  features: Record<string, boolean>;
}

// Configuration file types
export interface ConfigFileData {
  path: string;
  content: string;
  type: 'env' | 'yaml' | 'json' | 'toml';
  editable: boolean;
}

// Health check types
export interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  message: string;
  lastCheck: Date;
  details?: Record<string, any>;
}

// Cloudflare Tunnel types
export interface CloudflareTunnelService {
  id: string;
  name: string;
  displayName: string;
  description: string;
  port: number;
  protocol: 'http' | 'https' | 'tcp' | 'ssh';
  enabled: boolean;
  hostname?: string;
}

export interface CloudflareTunnelConfig {
  apiToken: string;
  accountId?: string;
  tunnelId?: string;
  tunnelName: string;
  services: CloudflareTunnelService[];
  status: 'idle' | 'configuring' | 'connecting' | 'active' | 'error';
  tunnelUrl?: string;
  error?: string;
}

export interface TunnelConnectionTest {
  service: string;
  url: string;
  status: 'pending' | 'testing' | 'success' | 'failed';
  responseTime?: number;
  error?: string;
}
