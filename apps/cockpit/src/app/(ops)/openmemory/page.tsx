import { ToolLinkPage } from "@/components/integrations/tool-link-page";

export default function OpenMemoryToolPage() {
  return (
    <ToolLinkPage
      name="OpenMemory"
      role="Memory diagnostics"
      description="Read-only gateway link for memory diagnostics. Assistant memory should remain routed through Nexus-compatible tools."
      url={process.env.NEXT_PUBLIC_OPENMEMORY_URL}
    />
  );
}
