/**
 * OpenClaw / PicoClaw Client for GPU Cluster task dispatching
 */

import axios, { AxiosInstance } from "axios";
import { Logger } from "../utils/logger";

export interface OpenClawConfig {
  gatewayUrl: string;
  authToken?: string;
  defaultWorker?: string;
}

export interface TaskDispatchPayload {
  task: string;
  model?: string;
  worker?: string;
  context?: Record<string, any>;
}

export interface TaskDispatchResult {
  success: boolean;
  taskId: string;
  worker: string;
  status: "completed" | "queued" | "failed";
  output?: string;
  error?: string;
}

export class OpenClawClient {
  private readonly client: AxiosInstance;
  private readonly logger: Logger;
  private readonly config: OpenClawConfig;

  constructor(config: OpenClawConfig) {
    this.config = config;
    this.logger = new Logger("OpenClawClient");

    this.client = axios.create({
      baseURL: config.gatewayUrl,
      timeout: 60000, // Long-running task generation
      headers: {
        "Content-Type": "application/json",
        ...(config.authToken
          ? { Authorization: `Bearer ${config.authToken}` }
          : {}),
      },
    });
  }

  async dispatchTask(
    payload: TaskDispatchPayload
  ): Promise<TaskDispatchResult> {
    const targetWorker =
      payload.worker || this.config.defaultWorker || "worker-rtx5090";

    this.logger.info("Dispatching task to GPU cluster...", {
      worker: targetWorker,
      model: payload.model || "hermes-3-405b",
    });

    try {
      // Dispatch task via OpenAI-compatible endpoint or custom routing endpoint on OpenClaw/PicoClaw gateway
      const response = await this.client.post("/v1/chat/completions", {
        model: payload.model || "hermes-3-405b",
        messages: [
          {
            role: "system",
            content: `You are running on Project Nyra's GPU worker: ${targetWorker}. Execute the following orchestration task.`,
          },
          {
            role: "user",
            content: payload.task,
          },
        ],
        temperature: 0.2,
      });

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
      taskId: `mock-task-${Math.random().toString(36).substr(2, 9)}`,
      worker: targetWorker,
      status: "completed",
      output: `[Mock GPU Output from ${targetWorker}] Task successfully completed using model ${payload.model || "hermes-3-405b"}.`,
    };
  }

  async checkWorkerHealth(workerNode: string): Promise<boolean> {
    return true;
  }
}
