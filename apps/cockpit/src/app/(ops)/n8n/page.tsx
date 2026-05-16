import { ToolLinkPage } from "@/components/integrations/tool-link-page";

export default function N8nToolPage() {
  return (
    <ToolLinkPage
      name="n8n"
      role="Workflow execution glue"
      description="Admin/debug link for n8n. It may execute steps, but it is not the broker-facing product UI or business brain."
      url={process.env.NEXT_PUBLIC_N8N_URL}
    />
  );
}
