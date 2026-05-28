"use client";

import { FormEvent, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Bot, Send, User, X } from "lucide-react";
import { readChatStream } from "@/utils/chatStream";
import { resolveTenantFromHost } from "@/utils/tenant";

type ChatRole = "assistant" | "user";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

const DEFAULT_GREETING =
  "Hi, I am your personal mortgage assistant. I can help explain mortgage options, required documents, and next steps.";

const DEFAULT_QUICK_PROMPTS = [
  "What documents do I need for pre-approval?",
  "How much should I plan for cash to close?",
  "Should I compare rate or APR first?",
];

function getChatEndpoint() {
  const directEndpoint = process.env.NEXT_PUBLIC_BORROWER_CHAT_ENDPOINT?.trim();
  if (directEndpoint) {
    return directEndpoint;
  }

  const legacyApiBase = process.env.NEXT_PUBLIC_BORROWER_CHAT_API_URL?.trim();
  if (legacyApiBase) {
    return `${legacyApiBase.replace(/\/$/, "")}/api/chat/stream`;
  }

  return "/api/openclaw/chat";
}

export function BorrowerChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: DEFAULT_GREETING },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndpoint = useMemo(() => getChatEndpoint(), []);

  async function sendMessage(content: string) {
    const userMessage: ChatMessage = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setIsLoading(true);
    try {
      const tenantId = resolveTenantFromHost(window.location.hostname);
      const response = await fetch(chatEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": tenantId,
        },
        body: JSON.stringify({
          persona: "borrower",
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
          role: "assistant",
          content:
            assistantReply ||
            "I am ready, but no response body was returned by your chat backend.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I could not reach the chat backend. Please try again in a moment.",
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
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <section className="w-[min(92vw,400px)] rounded-[32px] border border-white/10 bg-black/60 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col">
          <header className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                Ask Nyra AI
              </p>
              <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">
                Mortgage Assistant
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white transition-all"
            >
              Close
            </button>
          </header>

          <div className="border-b border-white/5 bg-white/5 px-6 py-3">
            <p className="text-[10px] leading-relaxed text-white/30 font-medium italic">
              Educational guidance only. Final rates and approval depend on full
              lender review and scenario analysis.
            </p>
          </div>

          <div className="h-[380px] space-y-4 overflow-y-auto p-6 custom-scrollbar bg-black/20">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "rounded-2xl px-4 py-3 text-xs font-medium leading-relaxed shadow-sm max-w-[85%]",
                  message.role === "assistant"
                    ? "bg-white/10 text-white border border-white/10 self-start rounded-bl-none"
                    : "bg-indigo-600 text-white self-end ml-auto rounded-br-none shadow-indigo-600/20"
                )}
              >
                {message.content}
              </div>
            ))}
            {isLoading ? (
              <div className="flex gap-1.5 items-center px-1">
                <div className="size-1 rounded-full bg-white/40 animate-bounce" />
                <div
                  className="size-1 rounded-full bg-white/40 animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="size-1 rounded-full bg-white/40 animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            ) : null}
          </div>

          <div className="border-t border-white/10 px-6 py-5 bg-black/40">
            <div className="mb-4 flex flex-wrap gap-2">
              {DEFAULT_QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-white/60 hover:bg-white/10 hover:text-white transition-all"
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
                placeholder="Ask a question..."
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/20"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50 shadow-lg shadow-indigo-600/20"
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
          className="group relative flex items-center gap-3 rounded-full border border-indigo-500/30 bg-black/60 px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-2xl backdrop-blur-xl hover:bg-black/80 transition-all hover:-translate-y-1"
        >
          <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-md group-hover:bg-indigo-500/20 transition-all" />
          <Bot className="size-4 text-indigo-400" />
          <span className="relative">Ask AI</span>
        </button>
      )}
    </div>
  );
}
