import React from 'react';
import { Mail, MessageSquare, Phone, PhoneMissed, FileText } from 'lucide-react';

interface ChannelPreviewProps {
  channel: string;
  templateId: string;
}

export function ChannelPreview({ channel, templateId }: ChannelPreviewProps) {
  if (!templateId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50 space-y-2">
        <FileText className="h-8 w-8" />
        <span className="text-xs font-semibold uppercase tracking-widest">No Template Selected</span>
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
      <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-200">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Preview: {templateId}</span>
      </div>
      
      {channel === 'email' && (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-slate-800">
            <span className="text-slate-400 mr-2 font-normal">Subject:</span>
            {mock.subject}
          </div>
          <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
            {mock.body}
          </div>
        </div>
      )}

      {channel === 'sms' && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl rounded-tl-sm p-3 text-sm text-blue-800 leading-relaxed shadow-sm">
          {mock.body}
        </div>
      )}

      {(channel === 'voice' || channel === 'missed_call_ping') && (
        <div className="flex items-start space-x-3">
          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
            <Phone className="h-4 w-4 text-slate-500" />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-3 text-sm text-slate-600 italic leading-relaxed shadow-sm flex-1">
            "{mock.body}"
          </div>
        </div>
      )}
    </div>
  );
}
