import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LeadList } from "@/components/leads/lead-list";
import { Lead } from "@/types";

const mockLeads: Lead[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1-555-0100",
    company: "Acme Corp",
    status: "qualified",
    source: "Website",
    campaignName: "Summer 2024",
    score: 85,
    createdAt: "2024-06-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    company: "TechCo",
    status: "new",
    source: "Referral",
    score: 65,
    createdAt: "2024-06-02T00:00:00Z",
    updatedAt: "2024-06-02T00:00:00Z",
  },
];

describe("LeadList", () => {
  it("renders lead list with correct data", () => {
    const onView = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <LeadList
        leads={mockLeads}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
    expect(screen.getByText("2 total")).toBeInTheDocument();
  });

  it("calls onView when view button is clicked", () => {
    const onView = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <LeadList
        leads={mockLeads}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    const viewButtons = screen.getAllByText("View");
    fireEvent.click(viewButtons[0]);

    expect(onView).toHaveBeenCalledWith(mockLeads[0]);
  });

  it("displays correct status badges", () => {
    const onView = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <LeadList
        leads={mockLeads}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText("qualified")).toBeInTheDocument();
    expect(screen.getByText("new")).toBeInTheDocument();
  });

  it("displays lead scores correctly", () => {
    const onView = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <LeadList
        leads={mockLeads}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getByText("65")).toBeInTheDocument();
  });
});
