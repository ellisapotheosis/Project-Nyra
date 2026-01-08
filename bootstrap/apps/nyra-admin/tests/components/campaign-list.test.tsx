import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CampaignList } from "@/components/campaigns/campaign-list";
import { Campaign } from "@/types";

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Summer 2024 Campaign",
    description: "Test campaign",
    status: "active",
    startDate: "2024-06-01",
    leads: 100,
    conversions: 20,
    createdAt: "2024-05-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Q4 Campaign",
    description: "Q4 push",
    status: "draft",
    startDate: "2024-10-01",
    leads: 0,
    conversions: 0,
    createdAt: "2024-09-01T00:00:00Z",
    updatedAt: "2024-09-01T00:00:00Z",
  },
];

describe("CampaignList", () => {
  it("renders campaign list with correct data", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onViewAnalytics = vi.fn();

    render(
      <CampaignList
        campaigns={mockCampaigns}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewAnalytics={onViewAnalytics}
      />
    );

    expect(screen.getByText("Summer 2024 Campaign")).toBeInTheDocument();
    expect(screen.getByText("Q4 Campaign")).toBeInTheDocument();
    expect(screen.getByText("2 total")).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onViewAnalytics = vi.fn();

    render(
      <CampaignList
        campaigns={mockCampaigns}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewAnalytics={onViewAnalytics}
      />
    );

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    expect(onEdit).toHaveBeenCalledWith(mockCampaigns[0]);
  });

  it("calls onViewAnalytics when analytics button is clicked", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onViewAnalytics = vi.fn();

    render(
      <CampaignList
        campaigns={mockCampaigns}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewAnalytics={onViewAnalytics}
      />
    );

    const analyticsButtons = screen.getAllByText("Analytics");
    fireEvent.click(analyticsButtons[0]);

    expect(onViewAnalytics).toHaveBeenCalledWith("1");
  });

  it("displays correct status badges", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onViewAnalytics = vi.fn();

    render(
      <CampaignList
        campaigns={mockCampaigns}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewAnalytics={onViewAnalytics}
      />
    );

    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.getByText("draft")).toBeInTheDocument();
  });
});
