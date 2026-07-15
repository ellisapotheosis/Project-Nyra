import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";

import { KanbanBoard } from "../components/leads/kanban-board";
import { crmApi } from "../lib/api";

// Mock the WebSocket hook
const mockSubscribe = jest.fn().mockResolvedValue(undefined);
const mockUnsubscribe = jest.fn().mockResolvedValue(undefined);
const mockEvents: any[] = [];

jest.mock("@project-nyra/websocket-client/react", () => ({
  useWebSocket: () => ({
    connected: true,
    connecting: false,
    sessionId: "test-session",
    connectionInfo: null,
    events: mockEvents,
    error: null,
    subscribe: mockSubscribe,
    unsubscribe: mockUnsubscribe,
    query: jest.fn(),
    command: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    clearEvents: jest.fn(),
  }),
}));

// Mock the CRM API client
jest.mock("../lib/api", () => {
  const original = jest.requireActual("../lib/api");
  return {
    ...original,
    crmApi: {
      getLeads: jest.fn().mockResolvedValue({
        leads: [
          {
            id: "lead-1",
            firstName: "John",
            lastName: "Doe",
            loanAmount: 450000,
            loanPurpose: "PURCHASE",
            stage: "NEW",
            phone: "123-456-7890",
            email: "john.doe@example.com",
          },
          {
            id: "lead-2",
            firstName: "Jane",
            lastName: "Smith",
            loanAmount: 600000,
            loanPurpose: "REFINANCE",
            stage: "CONTACTED",
            phone: "098-765-4321",
            email: "jane.smith@example.com",
          },
        ],
      }),
      updateLeadStatus: jest.fn().mockResolvedValue({ success: true }),
    },
    useApi: (fn: any) => ({
      execute: fn,
      data: null,
      error: null,
      isLoading: false,
    }),
  };
});

// Mock react-beautiful-dnd components to avoid strict mode rendering complexity in JSDOM
jest.mock("react-beautiful-dnd", () => ({
  DragDropContext: ({ children }: any) => <div>{children}</div>,
  Droppable: ({ children }: any) =>
    children(
      {
        draggableProps: {},
        innerRef: jest.fn(),
      },
      {}
    ),
  Draggable: ({ children }: any) =>
    children(
      {
        draggableProps: {},
        dragHandleProps: {},
        innerRef: jest.fn(),
      },
      {}
    ),
}));

describe("KanbanBoard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders columns and fetches leads correctly", async () => {
    await act(async () => {
      render(<KanbanBoard />);
    });

    // Check that column headers are rendered
    expect(screen.getByText("New Leads")).toBeInTheDocument();
    expect(screen.getByText("Contacted")).toBeInTheDocument();
    expect(screen.getByText("Nurturing")).toBeInTheDocument();

    // Verify leads are fetched and displayed
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();

    // Verify correct loan amounts are formatted and shown
    expect(screen.getByText("$450k")).toBeInTheDocument();
    expect(screen.getByText("$600k")).toBeInTheDocument();
  });

  it("subscribes to websocket crm:leads updates on mount", async () => {
    await act(async () => {
      render(<KanbanBoard />);
    });

    expect(mockSubscribe).toHaveBeenCalledWith("crm:leads");
  });
});
