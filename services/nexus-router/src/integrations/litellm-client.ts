/**
 * LiteLLM Proxy Client for Nexus Router
 * Integrates Nexus Router with LiteLLM for unified model access
 */

import axios, { AxiosInstance } from "axios";
import { config } from "../config";
import { createLogger } from "../utils/logger";

const logger = createLogger("nexus-router:litellm");

export interface LiteLLMConfig {
  baseURL: string;
  apiKey: string;
  timeout?: number;
  retries?: number;
}

export interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ModelInfo {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  supports_function_calling?: boolean;
  supports_vision?: boolean;
}

export class LiteLLMClient {
  private client: AxiosInstance;
  private config: LiteLLMConfig;

  constructor(config: LiteLLMConfig) {
    this.config = {
      timeout: 180000, // 3 minutes default
      retries: 3,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug("LiteLLM request", {
          method: config.method,
          url: config.url,
          model: (config.data as any)?.model,
        });
        return config;
      },
      (error) => {
        logger.error("LiteLLM request error", { error });
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug("LiteLLM response", {
          status: response.status,
          model: response.data?.model,
          usage: response.data?.usage,
        });
        return response;
      },
      (error) => {
        logger.error("LiteLLM response error", {
          status: error.response?.status,
          message: error.response?.data?.error?.message || error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Send chat completion request
   */
  async chatCompletion(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    try {
      const response = await this.client.post<ChatCompletionResponse>(
        "/v1/chat/completions",
        request
      );
      return response.data;
    } catch (error) {
      logger.error("Chat completion failed", {
        model: request.model,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Stream chat completion
   */
  async streamChatCompletion(
    request: ChatCompletionRequest,
    onChunk: (chunk: any) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await this.client.post(
        "/v1/chat/completions",
        { ...request, stream: true },
        { responseType: "stream" }
      );

      response.data.on("data", (chunk: Buffer) => {
        const lines = chunk
          .toString()
          .split("\n")
          .filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              onComplete();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              onChunk(parsed);
            } catch (e) {
              logger.warn("Failed to parse SSE chunk", { data });
            }
          }
        }
      });

      response.data.on("error", (error: Error) => {
        logger.error("Stream error", { error });
        onError(error);
      });

      response.data.on("end", () => {
        onComplete();
      });
    } catch (error) {
      logger.error("Stream chat completion failed", {
        model: request.model,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      onError(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<ModelInfo[]> {
    try {
      const response = await this.client.get<{ data: ModelInfo[] }>(
        "/v1/models"
      );
      return response.data.data;
    } catch (error) {
      logger.error("List models failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Get model information
   */
  async getModel(modelId: string): Promise<ModelInfo> {
    try {
      const response = await this.client.get<ModelInfo>(
        `/v1/models/${modelId}`
      );
      return response.data;
    } catch (error) {
      logger.error("Get model failed", {
        modelId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Check health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get("/health");
      return response.status === 200;
    } catch (error) {
      logger.warn("LiteLLM health check failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

  /**
   * Get metrics
   */
  async getMetrics(): Promise<any> {
    try {
      const response = await this.client.get("/health");
      return response.data.metrics;
    } catch (error) {
      logger.error("Get metrics failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}

/**
 * Create LiteLLM client instance with configuration from environment
 */
export function createLiteLLMClient(): LiteLLMClient {
  const litellmConfig: LiteLLMConfig = {
    baseURL: process.env.LITELLM_BASE_URL || "http://localhost:4000",
    apiKey: process.env.LITELLM_API_KEY || process.env.LITELLM_MASTER_KEY || "",
    timeout: parseInt(process.env.LITELLM_TIMEOUT || "180000", 10),
    retries: parseInt(process.env.LITELLM_RETRIES || "3", 10),
  };

  logger.info("Creating LiteLLM client", {
    baseURL: litellmConfig.baseURL,
    timeout: litellmConfig.timeout,
  });

  return new LiteLLMClient(litellmConfig);
}

// Export singleton instance
export const litellmClient = createLiteLLMClient();
