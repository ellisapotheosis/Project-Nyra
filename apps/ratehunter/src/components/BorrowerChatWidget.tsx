"use client";

import { FormEvent, useMemo, useState } from "react";
import { readChatStream } from "@/utils/chatStream";
import { resolveTenantFromHost } from "@/utils/tenant";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  X,
  MessageSquare,
  Sparkles,
  Clock,
  Mail,
  Phone,
  ChevronRight,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ChatRole = "assistant" | "user";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

const DEFAULT_GREETING =
  "HUB_TERMINAL_ONLINE: I am your Mortgage Assistant. I can help explain mortgage options, required documents, and next steps.";

const DEFAULT_QUICK_PROMPTS = [
  "Pre-approval documents",
  "Cash to close estimate",
  "Rate vs APR",
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
          content: "NEXUS_ROUTER_OFFLINE: Reverting to local fallback buffer.",
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
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[min(92vw,420px)] rounded-[32px] border border-border/50 bg-black/80 shadow-[0_0_50px_-12px_rgba(99,102,241,0.4)] backdrop-blur-xl overflow-hidden border-t-2 border-t-indigo-500 mb-6"
          >
            <header className="flex items-center justify-between border-b border-border/40 bg-indigo-500/5 px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg border border-indigo-400/30">
                  <Bot className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-foreground uppercase tracking-tight italic">
                    Ask AI
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="size-1.5 rounded-full bg-turquoise-500 animate-pulse shadow-[0_0_8px_rgba(20,184,166,1)]" />
                    <p className="text-[9px] font-bold text-turquoise-400 uppercase tracking-widest">
                      Protocol_Active
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="size-8 rounded-full border border-border/40 flex items-center justify-center text-muted-foreground hover:text-indigo-400 transition-colors bg-background/40"
              >
                <X className="size-4" />
              </button>
            </header>

            <div className="border-b border-border/30 bg-background/20 px-6 py-3">
              <p className="text-[9px] leading-relaxed text-muted-foreground font-bold uppercase tracking-tight opacity-60">
                Educational guidance only. Final terms depend on lender review
                and full financial scenario.
              </p>
            </div>

            <div className="max-h-[380px] min-h-[300px] flex flex-col overflow-hidden">
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`p-4 rounded-[20px] max-w-[85%] text-[11px] font-bold leading-relaxed uppercase tracking-tight shadow-xl ${
                          message.role === "assistant"
                            ? "bg-card/60 text-foreground border border-border/40 rounded-tl-none italic"
                            : "bg-indigo-600 text-white rounded-tr-none border border-indigo-400/30"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="p-3 bg-indigo-500/10 rounded-xl flex gap-1.5 shadow-inner">
                        <div className="size-1 bg-indigo-500 rounded-full animate-bounce" />
                        <div className="size-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="size-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="border-t border-border/40 p-6 bg-background/30 backdrop-blur-xl">
              <div className="mb-6 flex flex-wrap gap-2">
                {DEFAULT_QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1.5 text-[9px] font-black text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all shadow-inner uppercase tracking-widest"
                    disabled={isLoading}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <form onSubmit={onSubmit} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-turquoise-400 rounded-2xl opacity-10 group-focus-within:opacity-30 transition-opacity blur-md" />
                <div className="relative flex items-center gap-3 bg-background/60 border border-border/50 rounded-xl p-2 pr-3 focus-within:border-indigo-500/50 transition-all shadow-2xl">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="INITIATE_INQUIRY..."
                    className="flex-1 bg-transparent px-3 py-2 text-[10px] font-black text-foreground outline-none placeholder:text-muted-foreground/30 uppercase tracking-widest"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="size-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-500 active:scale-90 disabled:opacity-50"
                  >
                    <Send className="size-4" />
                  </button>
                </div>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={() => setOpen(true)}
        className="size-16 rounded-[24px] bg-indigo-600 flex items-center justify-center text-white shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)] border border-indigo-400/40 relative group"
      >
        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full group-hover:scale-150 transition-transform opacity-50" />
        <MessageSquare className="size-7 relative z-10" />
        <div className="absolute -top-1 -right-1 size-4 bg-turquoise-500 rounded-full border-2 border-black flex items-center justify-center text-[8px] font-black text-black z-20">
          ▲
        </div>
      </motion.button>
    </div>
  );
}
