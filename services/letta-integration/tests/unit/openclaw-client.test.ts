import {
  OpenClawClient,
  MockOpenClawClient,
} from "../../src/client/openclaw-client";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("OpenClaw / PicoClaw Client & Mock Dispatcher", () => {
  const config = {
    gatewayUrl: "http://orchestrator.trex-fiordland.ts.net:5678",
    authToken: "test-auth-token",
  };

  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAxiosInstance = {
      post: jest.fn(),
      get: jest.fn(),
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);
  });

  it("should initialize OpenClawClient correctly", () => {
    const client = new OpenClawClient(config);
    expect(client).toBeDefined();
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: "http://orchestrator.trex-fiordland.ts.net:5678",
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-auth-token",
      },
    });
  });

  it("should successfully dispatch tasks to specific GPU workers", async () => {
    const payload = {
      task: "Scan database for pending leads",
      worker: "worker-rtx3090ti",
      model: "hermes-3-405b",
    };

    mockAxiosInstance.post.mockResolvedValueOnce({
      data: {
        id: "chatcmpl-mock-1234",
        choices: [
          {
            message: {
              content: "Completed lead scan. Found 3 pending leads.",
            },
          },
        ],
      },
    });

    const client = new OpenClawClient(config);
    const result = await client.dispatchTask(payload);

    expect(result.success).toBe(true);
    expect(result.status).toBe("completed");
    expect(result.worker).toBe("worker-rtx3090ti");
    expect(result.output).toContain("Found 3 pending leads.");

    expect(mockAxiosInstance.post).toHaveBeenCalledWith(
      "/v1/chat/completions",
      expect.objectContaining({
        model: "hermes-3-405b",
        messages: expect.any(Array),
      })
    );
  });

  it("should return failure status when gateway call throws", async () => {
    mockAxiosInstance.post.mockRejectedValueOnce(
      new Error("Connection timeout")
    );

    const client = new OpenClawClient(config);
    const result = await client.dispatchTask({
      task: "Process queue",
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe("failed");
    expect(result.error).toBe("Connection timeout");
  });

  it("should mock task dispatching cleanly", async () => {
    const mockClient = new MockOpenClawClient();
    const result = await mockClient.dispatchTask({
      task: "Run local model inference",
      worker: "worker-rtx3060",
    });

    expect(result.success).toBe(true);
    expect(result.worker).toBe("worker-rtx3060");
    expect(result.status).toBe("completed");
    expect(result.output).toContain("completed");
  });
});
