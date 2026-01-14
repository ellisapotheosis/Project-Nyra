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
  | 'windows'
  | 'wsl'
  | 'deployment'
  | 'validation'
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
