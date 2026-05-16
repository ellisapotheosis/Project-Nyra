import { ToolLinkPage } from "@/components/integrations/tool-link-page";

export default function ActivepiecesToolPage() {
  return (
    <ToolLinkPage
      name="Activepieces"
      role="Workflow execution glue"
      description="Admin/debug link for Activepieces. Campaign state and compliance decisions remain in Nyra services."
      url={process.env.NEXT_PUBLIC_ACTIVEPIECES_URL}
    />
  );
}
