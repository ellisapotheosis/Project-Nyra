'use client';

import { FormEvent, useMemo, useState } from 'react';
import { readChatStream } from '@/utils/chatStream';
import { resolveTenantFromHost } from '@/utils/tenant';

type ChatRole = 'assistant' | 'user';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

const DEFAULT_GREETING =
  'Hi, I am Nyra. I can help explain mortgage options, required documents, and next steps.';

const DEFAULT_QUICK_PROMPTS = [
  'What documents do I need for pre-approval?',
  'How much should I plan for cash to close?',
  'Should I compare rate or APR first?',
];

function getChatEndpoint() {
  const directEndpoint = process.env.NEXT_PUBLIC_BORROWER_CHAT_ENDPOINT?.trim();
  if (directEndpoint) {
    return directEndpoint;
  }

  const legacyApiBase = process.env.NEXT_PUBLIC_BORROWER_CHAT_API_URL?.trim();
  if (legacyApiBase) {
    return `${legacyApiBase.replace(/\/$/, '')}/api/chat/stream`;
  }

  return '/api/openclaw/chat';
}

export function BorrowerChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', content: DEFAULT_GREETING }]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndpoint = useMemo(() => getChatEndpoint(), []);

  async function sendMessage(content: string) {
    const userMessage: ChatMessage = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    setIsLoading(true);
    try {
      const tenantId = resolveTenantFromHost(window.location.hostname);
      const response = await fetch(chatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
          persona: 'borrower',
          messages: [...messages, userMessage],
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API returned ${response.status}`);
      }

      const assistantReply = await readChatStream(response);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: assistantReply || 'I am ready, but no response body was returned by your chat backend.',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I could not reach the chat backend. Please try again in a moment.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim() || isLoading) return;
    await sendMessage(input.trim());
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <section className="w-[min(92vw,380px)] rounded-[1.8rem] border border-[rgba(13,83,120,0.18)] bg-[rgba(10,28,45,0.96)] shadow-2xl backdrop-blur">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#f6d6c2]">Ask Nyra</p>
              <p className="text-xs text-white/60">Borrower assistant</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70"
            >
              Close
            </button>
          </header>

          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-xs leading-6 text-white/60">
              Educational guidance only. Final rates, APR, and approval terms depend on lender review and
              your full scenario.
            </p>
          </div>

          <div className="max-h-[360px] space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-xl px-3 py-2 text-sm ${
                  message.role === 'assistant'
                    ? 'border border-[#f6d6c2]/15 bg-[#f6d6c2]/8 text-[#fff3eb]'
                    : 'border border-[#8fc4de]/20 bg-[#8fc4de]/10 text-[#dff5ff]'
                }`}
              >
                {message.content}
              </div>
            ))}
            {isLoading ? <p className="text-xs text-white/55">Nyra is typing...</p> : null}
          </div>

          <div className="border-t border-white/10 px-4 py-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {DEFAULT_QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-white/14 px-3 py-1 text-xs text-white/75"
                  disabled={isLoading}
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form onSubmit={onSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about rates, docs, closing..."
                className="flex-1 rounded-xl border border-white/12 bg-white/6 px-3 py-2 text-sm text-white outline-none focus:border-[#f6d6c2]"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-xl bg-[#f6d6c2] px-3 py-2 text-sm font-medium text-[#0d2d4c] disabled:opacity-60"
              >
                Send
              </button>
            </form>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border border-[rgba(13,83,120,0.18)] bg-[var(--brand-deep)] px-5 py-3 text-sm font-semibold text-white shadow-lg"
        >
          Ask Nyra
        </button>
      )}
    </div>
  );
}
