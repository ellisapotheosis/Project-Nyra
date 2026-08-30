/**
 * OpenClaw / PicoClaw Client for GPU cluster task dispatching.
 *
 * File-backed authentication is resolved for every request so an Infisical
 * sidecar can rotate the gateway token without copying it into agent context.
 */

import axios, { AxiosInstance } from "axios";
import { readFile } from "node:fs/promises";
import { Logger } from "../utils/logger";

export interface OpenClawConfig {
  gatewayUrl: string;
  /** @deprecated Prefer authTokenFile for rotation and process isolation. */
  authToken?: string;
  authTokenFile?: string;
  defaultWorker?: string;
}

export interface TaskDispatchPayload {
  task: string;
  model?: string;
  worker?: string;
  context?: Record<string, unknown>;
}

export interface TaskDispatchResult {
  success: boolean;
  taskId: string;
  worker: string;
  status: "completed" | "queued" | "failed";
  output?: string;
  error?: string;
}

export const AGENT_TARGET_WORKSPACES = [
  "nyra_mortgage_assistant",
  "code_refactor_pipeline",
  "cluster_monitor",
] as const;

export const EXECUTION_PRIORITIES = [
  "CRITICAL_IMMEDIATE",
  "STANDARD_ROUTING",
  "BATCH_BACKGROUND",
] as const;

export type AgentTargetWorkspace = (typeof AGENT_TARGET_WORKSPACES)[number];
export type ExecutionPriority = (typeof EXECUTION_PRIORITIES)[number];

export interface SecureTaskDirective {
  agent_target_workspace: AgentTargetWorkspace;
  task_directive: string;
  execution_priority?: ExecutionPriority;
  idempotency_key?: string;
}

const OPENCLAW_EXECUTE_SECURE_TASK_PARAMETERS = {
  type: "object",
  additionalProperties: false,
  properties: {
    agent_target_workspace: {
      type: "string",
      enum: AGENT_TARGET_WORKSPACES,
    },
    task_directive: {
      type: "string",
      minLength: 1,
      maxLength: 20000,
    },
    execution_priority: {
      type: "string",
      enum: EXECUTION_PRIORITIES,
      default: "STANDARD_ROUTING",
    },
    idempotency_key: {
      type: "string",
      minLength: 8,
      maxLength: 128,
      pattern: "^[A-Za-z0-9._:-]+$",
    },
  },
  required: ["agent_target_workspace", "task_directive"],
} as const;

export const OPENCLAW_EXECUTE_SECURE_TASK_TOOL_SCHEMA = {
  name: "openclaw_execute_secure_task",
  description:
    "Dispatch a validated task to OpenClaw. Authentication is resolved from a host-controlled file sink and is never accepted as tool input.",
  parameters: OPENCLAW_EXECUTE_SECURE_TASK_PARAMETERS,
  inputSchema: OPENCLAW_EXECUTE_SECURE_TASK_PARAMETERS,
} as const;

export function parseSecureTaskDirective(input: unknown): SecureTaskDirective {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("secure task must be an object");
  }

  const value = input as Record<string, unknown>;
  const allowedKeys = new Set([
    "agent_target_workspace",
    "task_directive",
    "execution_priority",
    "idempotency_key",
  ]);
  const unexpected = Object.keys(value).filter((key) => !allowedKeys.has(key));
  if (unexpected.length > 0) {
    throw new TypeError(`unexpected secure task fields: ${unexpected.join(", ")}`);
  }

  if (
    typeof value.agent_target_workspace !== "string" ||
    !AGENT_TARGET_WORKSPACES.includes(
      value.agent_target_workspace as AgentTargetWorkspace
    )
  ) {
    throw new TypeError("invalid agent_target_workspace");
  }
  if (
    typeof value.task_directive !== "string" ||
    value.task_directive.trim().length === 0 ||
    value.task_directive.length > 20000
  ) {
    throw new TypeError("task_directive must contain 1-20000 characters");
  }

  const priority = value.execution_priority ?? "STANDARD_ROUTING";
  if (
    typeof priority !== "string" ||
    !EXECUTION_PRIORITIES.includes(priority as ExecutionPriority)
  ) {
    throw new TypeError("invalid execution_priority");
  }

  if (
    value.idempotency_key !== undefined &&
    (typeof value.idempotency_key !== "string" ||
      !/^[A-Za-z0-9._:-]{8,128}$/.test(value.idempotency_key))
  ) {
    throw new TypeError("invalid idempotency_key");
  }

  return {
    agent_target_workspace:
      value.agent_target_workspace as AgentTargetWorkspace,
    task_directive: value.task_directive.trim(),
    execution_priority: priority as ExecutionPriority,
    ...(typeof value.idempotency_key === "string"
      ? { idempotency_key: value.idempotency_key }
      : {}),
  };
}

export class OpenClawClient {
  private readonly client: AxiosInstance;
  private readonly logger: Logger;
  private readonly config: OpenClawConfig;

  constructor(config: OpenClawConfig) {
    if (config.authToken && config.authTokenFile) {
      throw new Error("configure exactly one of authToken or authTokenFile");
    }

    this.config = config;
    this.logger = new Logger("OpenClawClient");
    this.client = axios.create({
      baseURL: config.gatewayUrl,
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
        ...(config.authToken
          ? { Authorization: `Bearer ${config.authToken}` }
          : {}),
      },
    });
  }

  private async resolveAuthHeaders(): Promise<Record<string, string>> {
    if (!this.config.authTokenFile) {
      return {};
    }

    const token = (await readFile(this.config.authTokenFile, "utf8")).trim();
    if (!token) {
      throw new Error("OpenClaw auth token file is empty");
    }
    return { Authorization: `Bearer ${token}` };
  }

  async dispatchTask(
    payload: TaskDispatchPayload
  ): Promise<TaskDispatchResult> {
    const targetWorker =
      payload.worker || this.config.defaultWorker || "worker-rtx5090";

    this.logger.info("Dispatching task to GPU cluster...", {
      worker: targetWorker,
      model: payload.model || "composite/reasoning",
    });

    try {
      const requestBody = {
        model: payload.model || "composite/reasoning",
        messages: [
          {
            role: "system",
            content: `You are running on Project Nyra's GPU worker: ${targetWorker}. Execute the following orchestration task.`,
          },
          { role: "user", content: payload.task },
        ],
        temperature: 0.2,
        ...(payload.context ? { metadata: payload.context } : {}),
      };
      const authHeaders = await this.resolveAuthHeaders();
      const response = Object.keys(authHeaders).length
        ? await this.client.post("/v1/chat/completions", requestBody, {
            headers: authHeaders,
          })
        : await this.client.post("/v1/chat/completions", requestBody);

      const choice = response.data?.choices?.[0]?.message;
      return {
        success: true,
        taskId: response.data?.id || `task-${Date.now()}`,
        worker: targetWorker,
        status: "completed",
        output: choice?.content || "",
      };
    } catch (err) {
      this.logger.error("Failed to dispatch task to GPU worker:", err);
      return {
        success: false,
        taskId: `err-${Date.now()}`,
        worker: targetWorker,
        status: "failed",
        error: (err as Error).message,
      };
    }
  }

  async dispatchSecureTask(input: unknown): Promise<TaskDispatchResult> {
    const task = parseSecureTaskDirective(input);
    return this.dispatchTask({
      task: task.task_directive,
      context: {
        agent_target_workspace: task.agent_target_workspace,
        execution_priority: task.execution_priority,
        ...(task.idempotency_key
          ? { idempotency_key: task.idempotency_key }
          : {}),
      },
    });
  }

  async checkWorkerHealth(workerNode: string): Promise<boolean> {
    try {
      const response = await this.client.get(`/health/workers/${workerNode}`);
      return response.status === 200 && response.data?.status === "HEALTHY";
    } catch {
      return false;
    }
  }
}

export class MockOpenClawClient {
  private readonly logger = new Logger("MockOpenClawClient");

  async dispatchTask(
    payload: TaskDispatchPayload
  ): Promise<TaskDispatchResult> {
    const targetWorker = payload.worker || "worker-rtx5090";
    this.logger.info("[Mock] Dispatching task to GPU worker:", targetWorker);
    return {
      success: true,
      taskId: `mock-task-${Math.random().toString(36).slice(2, 11)}`,
      worker: targetWorker,
      status: "completed",
      output: `[Mock GPU Output from ${targetWorker}] Task successfully completed using model ${payload.model || "composite/reasoning"}.`,
    };
  }

  async checkWorkerHealth(_workerNode: string): Promise<boolean> {
    return true;
  }
}
