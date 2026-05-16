import React from 'react';
import { Mail, MessageSquare, Phone, PhoneMissed, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChannelPreviewProps {
  channel: string;
  templateId: string;
}

export function ChannelPreview({ channel, templateId }: ChannelPreviewProps) {
  if (!templateId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 space-y-3">
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 shadow-inner">
          <FileText className="h-10 w-10 text-primary/50" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">WAITING_FOR_TEMPLATE</span>
      </div>
    );
  }

  // Mock template data for preview
  const getMockTemplate = () => {
    if (channel === 'email') {
      return {
        subject: "Your Custom Mortgage Options",
        body: "Hi there,\n\nBased on our recent conversation, I've put together some options for you. Please let me know what you think.\n\nBest,\nEllis"
      };
    }
    if (channel === 'sms') {
      return {
        body: "Hi! This is Ellis. Are you still looking to refinance? Rates just dropped a bit today. Let me know!"
      };
    }
    if (channel === 'voice' || channel === 'missed_call_ping') {
      return {
        body: "Hey, this is Ellis calling from the mortgage desk. Just wanted to quickly touch base on your recent inquiry. Give me a call back when you can. Thanks!"
      };
    }
    return { subject: '', body: 'Preview not available for this channel.' };
  };

  const mock = getMockTemplate();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-border/50">
        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-background/50 text-emerald-300 border-emerald-500/20">PREVIEW: {templateId.toUpperCase()}</Badge>
      </div>

      {channel === 'email' && (
        <div className="space-y-4">
          <div className="text-xs font-black text-foreground bg-background/40 p-2 rounded-lg border border-border/50">
            <span className="text-muted-foreground mr-2 font-bold uppercase tracking-tight">SUBJECT:</span>
            {mock.subject}
          </div>
          <div className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed bg-primary/5 p-4 rounded-lg border border-primary/10 italic">
            {mock.body}
          </div>
        </div>
      )}

      {channel === 'sms' && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg rounded-tl-sm p-4 text-xs text-emerald-300 font-bold leading-relaxed shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
          {mock.body}
        </div>
      )}

      {(channel === 'voice' || channel === 'missed_call_ping') && (
        <div className="flex items-start space-x-4">
          <div className="h-10 w-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 shadow-lg">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <div className="bg-background/60 border border-border/50 rounded-lg rounded-tl-sm p-4 text-xs text-muted-foreground italic leading-relaxed shadow-inner flex-1 border-l-2 border-l-destructive">
            "{mock.body}"
          </div>
        </div>
      )}
    </div>
  );
}
