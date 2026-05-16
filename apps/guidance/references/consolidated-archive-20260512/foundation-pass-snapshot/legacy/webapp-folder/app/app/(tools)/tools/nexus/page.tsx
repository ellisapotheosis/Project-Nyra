import { ToolLinkPage } from "@/components/integrations/tool-link-page";

export default function NexusToolPage() {
  return (
    <ToolLinkPage
      name="Nexus Router"
      role="Model, MCP, and memory gateway"
      description="Gateway link for Nexus Router diagnostics. Agents should route memory/tool access through Nexus where feasible."
      url={process.env.NEXT_PUBLIC_NEXUS_UI_URL}
    />
  );
}
