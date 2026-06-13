import React from "react";
import {
  Mail,
  MessageSquare,
  Phone,
  PhoneMissed,
  FileText,
} from "lucide-react";

interface ChannelPreviewProps {
  channel: string;
  templateId: string;
}

export function ChannelPreview({ channel, templateId }: ChannelPreviewProps) {
  if (!templateId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 space-y-2">
        <FileText className="h-8 w-8" />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          No Content Staged
        </span>
      </div>
    );
  }

  // Mock template data for preview
  const getMockTemplate = () => {
    if (channel === "email") {
      return {
        subject: "Your Custom Mortgage Options",
        body: "Hi there,\n\nBased on our recent conversation, I've put together some options for you. Please let me know what you think.\n\nBest,\nEllis",
      };
    }
    if (channel === "sms") {
      return {
        body: "Hi! This is Ellis. Are you still looking to refinance? Rates just dropped a bit today. Let me know!",
      };
    }
    if (channel === "voice" || channel === "missed_call_ping") {
      return {
        body: "Hey, this is Ellis calling from the mortgage desk. Just wanted to quickly touch base on your recent inquiry. Give me a call back when you can. Thanks!",
      };
    }
    return { subject: "", body: "Preview not available for this channel." };
  };

  const mock = getMockTemplate();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-border/40">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
          Transmission Preview • {templateId}
        </span>
      </div>

      {channel === "email" && (
        <div className="space-y-4">
          <div className="text-xs font-bold text-foreground">
            <span className="text-muted-foreground/60 mr-2 font-medium uppercase tracking-tighter">
              Subject:
            </span>
            {mock.subject}
          </div>
          <div className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed bg-muted/20 p-4 rounded-xl border border-border/20">
            {mock.body}
          </div>
        </div>
      )}

      {channel === "sms" && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl rounded-tl-sm p-4 text-xs text-indigo-300 leading-relaxed shadow-[0_0_20px_-5px_rgba(var(--indigo-rgb),0.2)]">
          {mock.body}
        </div>
      )}

      {(channel === "voice" || channel === "missed_call_ping") && (
        <div className="flex items-start space-x-4">
          <div className="h-10 w-10 rounded-xl bg-turquoise-500/10 border border-turquoise-500/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_-3px_rgba(var(--turquoise-rgb),0.2)]">
            <Phone className="h-5 w-5 text-turquoise-400" />
          </div>
          <div className="bg-background/40 border border-border/40 rounded-2xl rounded-tl-sm p-4 text-xs text-muted-foreground italic leading-relaxed shadow-sm flex-1">
            "{mock.body}"
          </div>
        </div>
      )}
    </div>
  );
}
