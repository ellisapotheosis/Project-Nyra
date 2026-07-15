import { LettaClient } from "../../src/client/letta-client";
import { MemoryStore } from "../../src/memory/memory-store";
import { MemoryManager } from "../../src/memory/memory-manager";
import { MemoryType } from "../../src/types";
import axios from "axios";

jest.mock("uuid", () => ({
  v4: () => "mock-uuid-1234",
}));

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Letta Client & Memory Manager", () => {
  const config = {
    baseUrl: "http://localhost:8283",
    apiKey: "test-api-key",
  };

  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAxiosInstance = {
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
      post: jest.fn(),
      get: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);
  });

  it("should initialize LettaClient correctly", () => {
    const client = new LettaClient(config);
    expect(client).toBeDefined();
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: "http://localhost:8283",
      timeout: 30000,
      headers: {
        Authorization: "Bearer test-api-key",
        "Content-Type": "application/json",
      },
    });
  });

  it("should create memory via Letta API", async () => {
    const memoryPayload = {
      agentId: "agent-123",
      type: MemoryType.FACT,
      content: "Ellis prefers turquoise themes",
      metadata: {},
      importance: 0.8,
      tags: [],
      references: [],
    };

    mockAxiosInstance.post.mockResolvedValueOnce({
      data: { id: "mem-999", ...memoryPayload },
    });

    const client = new LettaClient(config);
    const result = await client.createMemory(memoryPayload);

    expect(result.id).toBe("mem-999");
    expect(mockAxiosInstance.post).toHaveBeenCalledWith(
      "/memories",
      memoryPayload
    );
  });

  it("should fetch memory details by ID", async () => {
    const mockMemory = {
      id: "mem-123",
      content: "VA loans require funding fees",
    };

    mockAxiosInstance.get.mockResolvedValueOnce({
      data: mockMemory,
    });

    const client = new LettaClient(config);
    const result = await client.getMemory("mem-123");

    expect(result).toEqual(mockMemory);
    expect(mockAxiosInstance.get).toHaveBeenCalledWith("/memories/mem-123");
  });

  it("should coordinate local store and remote client in MemoryManager", async () => {
    const mockStore = {
      saveMemory: jest.fn().mockResolvedValue(undefined),
      getMemoriesByType: jest.fn().mockResolvedValue([]),
    } as unknown as MemoryStore;

    const mockClient = {
      createMemory: jest.fn().mockResolvedValue({ id: "remote-999" }),
    } as unknown as LettaClient;

    const manager = new MemoryManager(mockStore, "agent-555", mockClient);
    const memory = await manager.addMemory(
      "Lead status updated to PENDING",
      MemoryType.CONTEXT,
      { leadId: "lead-abc" },
      0.9
    );

    expect(memory.content).toBe("Lead status updated to PENDING");
    expect(mockStore.saveMemory).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: "agent-555",
        content: "Lead status updated to PENDING",
      })
    );
    expect(mockClient.createMemory).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: "agent-555",
        content: "Lead status updated to PENDING",
      })
    );
  });
});
