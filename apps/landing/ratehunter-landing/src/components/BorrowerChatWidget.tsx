'use client';

import { FormEvent, useMemo, useState } from 'react';

type ChatRole = 'assistant' | 'user';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

const DEFAULT_GREETING =
  'Hi, I am Nyra. I can help explain mortgage options, required documents, and next steps.';

const DEFAULT_QUICK_PROMPTS = [
  'What credit score do I need?',
  'How much house can I afford?',
  'What docs are needed for pre-approval?',
];

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_BORROWER_CHAT_API_URL?.trim() || '';
}

export function BorrowerChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', content: DEFAULT_GREETING }]);
  const [isLoading, setIsLoading] = useState(false);
  const apiBase = useMemo(() => getApiBaseUrl(), []);

  async function sendMessage(content: string) {
    const userMessage: ChatMessage = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    if (!apiBase) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Chat backend is not configured yet. Set NEXT_PUBLIC_BORROWER_CHAT_API_URL and connect it to your streaming service.',
        },
      ]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${apiBase.replace(/\/$/, '')}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          persona: 'borrower',
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API returned ${response.status}`);
      }

      const payload = (await response.json()) as { reply?: string };
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: payload.reply || 'I am ready, but no response body was returned by your chat backend.',
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
        <section className="w-[min(92vw,360px)] rounded-2xl border border-cyan-500/30 bg-slate-950/95 shadow-2xl backdrop-blur">
          <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-cyan-200">Ask Nyra</p>
              <p className="text-xs text-slate-400">Borrower assistant</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300"
            >
              Close
            </button>
          </header>

          <div className="max-h-[360px] space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-xl px-3 py-2 text-sm ${
                  message.role === 'assistant'
                    ? 'border border-cyan-500/30 bg-cyan-500/10 text-cyan-100'
                    : 'border border-violet-500/40 bg-violet-500/10 text-violet-100'
                }`}
              >
                {message.content}
              </div>
            ))}
            {isLoading ? <p className="text-xs text-slate-400">Nyra is typing…</p> : null}
          </div>

          <div className="border-t border-slate-800 px-4 py-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {DEFAULT_QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300"
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
                className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-950 disabled:opacity-60"
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
          className="rounded-full border border-cyan-400/60 bg-cyan-500/20 px-4 py-3 text-sm font-semibold text-cyan-100 shadow-lg"
        >
          Ask Nyra
        </button>
      )}
    </div>
  );
}
