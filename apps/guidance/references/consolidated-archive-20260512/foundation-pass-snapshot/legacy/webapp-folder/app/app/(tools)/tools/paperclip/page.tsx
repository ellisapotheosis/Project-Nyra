import { ToolLinkPage } from "@/components/integrations/tool-link-page";

export default function PaperclipToolPage() {
  return (
    <ToolLinkPage
      name="Paperclip"
      role="Governance and workflow review"
      description="Admin/debug link for Paperclip governance. Operational borrower actions still require Nyra service approval and audit trails."
      url={process.env.NEXT_PUBLIC_PAPERCLIP_URL}
    />
  );
}
