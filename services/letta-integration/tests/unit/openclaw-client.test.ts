import {
  OpenClawClient,
  MockOpenClawClient,
  parseSecureTaskDirective,
} from "../../src/client/openclaw-client";
import axios from "axios";
import { readFile } from "node:fs/promises";

jest.mock("axios");
jest.mock("node:fs/promises", () => ({ readFile: jest.fn() }));
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedReadFile = readFile as jest.Mock;

describe("OpenClaw / PicoClaw Client & Mock Dispatcher", () => {
  const config = {
    gatewayUrl: "http://orchestrator.trex-fiordland.ts.net:5678",
    authToken: "test-auth-token",
  };

  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAxiosInstance = { post: jest.fn(), get: jest.fn() };
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
  });

  it("initializes with a legacy process token", () => {
    const client = new OpenClawClient(config);
    expect(client).toBeDefined();
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: config.gatewayUrl,
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-auth-token",
      },
    });
  });

  it("reads a rotating file-backed token for every request", async () => {
    mockedReadFile.mockResolvedValue("rotated-token\n");
    mockAxiosInstance.post.mockResolvedValueOnce({
      data: {
        id: "chatcmpl-file-token",
        choices: [{ message: { content: "done" } }],
      },
    });

    const client = new OpenClawClient({
      gatewayUrl: config.gatewayUrl,
      authTokenFile: "/run/nyra-secrets/current/openclaw_gateway_token",
    });
    const result = await client.dispatchTask({ task: "Process queue" });

    expect(result.success).toBe(true);
    expect(mockedReadFile).toHaveBeenCalledWith(
      "/run/nyra-secrets/current/openclaw_gateway_token",
      "utf8"
    );
    expect(mockAxiosInstance.post).toHaveBeenCalledWith(
      "/v1/chat/completions",
      expect.any(Object),
      { headers: { Authorization: "Bearer rotated-token" } }
    );
  });

  it("dispatches tasks to specific GPU workers", async () => {
    mockAxiosInstance.post.mockResolvedValueOnce({
      data: {
        id: "chatcmpl-mock-1234",
        choices: [
          { message: { content: "Completed lead scan. Found 3 pending leads." } },
        ],
      },
    });

    const client = new OpenClawClient(config);
    const result = await client.dispatchTask({
      task: "Scan database for pending leads",
      worker: "worker-rtx3090ti",
      model: "composite/coding",
    });

    expect(result.success).toBe(true);
    expect(result.worker).toBe("worker-rtx3090ti");
    expect(result.output).toContain("Found 3 pending leads.");
  });

  it("rejects agent-controlled secret-scope fields", () => {
    expect(() =>
      parseSecureTaskDirective({
        agent_target_workspace: "cluster_monitor",
        task_directive: "Check worker health",
        infisical_secret_scope: "/production/admin",
      })
    ).toThrow("unexpected secure task fields");
  });

  it("returns failure status when gateway call throws", async () => {
    mockAxiosInstance.post.mockRejectedValueOnce(new Error("Connection timeout"));
    const client = new OpenClawClient(config);
    const result = await client.dispatchTask({ task: "Process queue" });
    expect(result.success).toBe(false);
    expect(result.status).toBe("failed");
    expect(result.error).toBe("Connection timeout");
  });

  it("mocks task dispatching cleanly", async () => {
    const mockClient = new MockOpenClawClient();
    const result = await mockClient.dispatchTask({
      task: "Run local model inference",
      worker: "worker-rtx3060",
    });
    expect(result.success).toBe(true);
    expect(result.worker).toBe("worker-rtx3060");
  });
});
