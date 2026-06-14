// apps/projectnyra/src/components/ai-sidebar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, X, Send, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  leadContext?: string;
}

const NEXUS_URL = process.env.NEXT_PUBLIC_NEXUS_ROUTER_URL ?? "";

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi, I'm Nyra. Ask me about your pipeline, leads, or current rates. What do you need?",
};

export function AiSidebar({ isOpen, onClose, leadContext }: AiSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch(`${NEXUS_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          ...(leadContext && { context: `Current lead: ${leadContext}` }),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        response?: string;
        message?: string;
      };
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response ?? data.message ?? "Got it — anything else?",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Nexus Router is offline. Check the infra dashboard and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40"
            style={{
              background: "rgba(0,0,0,0.25)",
              backdropFilter: "blur(2px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
            style={{
              width: 360,
              background: "rgba(4,4,14,0.97)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderLeft: "1px solid rgba(80,56,255,0.25)",
              boxShadow: "-10px 0 50px rgba(80,56,255,0.12)",
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 310, damping: 32 }}
            aria-label="Ask Nyra AI sidebar"
            role="complementary"
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 16px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, oklch(0.5038 0.2937 285.3753), oklch(0.8871 0.1828 166.5465))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 0 14px rgba(80,56,255,0.5)",
                }}
              >
                <Bot size={16} color="white" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>
                  Ask Nyra
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "oklch(0.8871 0.1828 166.5465)",
                    marginTop: 1,
                  }}
                >
                  ● Online {leadContext && `— ${leadContext}`}
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  padding: 6,
                  borderRadius: 6,
                  lineHeight: 0,
                }}
                aria-label="Close AI sidebar"
              >
                <X size={15} />
              </button>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "84%",
                      padding: "9px 13px",
                      borderRadius:
                        msg.role === "user"
                          ? "14px 14px 4px 14px"
                          : "14px 14px 14px 4px",
                      background:
                        msg.role === "user"
                          ? "linear-gradient(135deg, oklch(0.5038 0.2937 285.3753), oklch(0.65 0.27 300))"
                          : "rgba(255,255,255,0.055)",
                      border:
                        msg.role === "assistant"
                          ? "1px solid rgba(255,255,255,0.07)"
                          : "none",
                      fontSize: 12.5,
                      lineHeight: 1.6,
                      color: "white",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Loader2
                    size={13}
                    color="oklch(0.5038 0.2937 285.3753)"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  <span style={{ fontSize: 11, color: "#64748b" }}>
                    Nyra is thinking…
                  </span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div
              style={{
                padding: "10px 12px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="Ask about your pipeline…"
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.055)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 10,
                  padding: "8px 12px",
                  fontSize: 12.5,
                  color: "white",
                  outline: "none",
                  fontFamily: "inherit",
                  lineHeight: 1.4,
                }}
              />
              <button
                onClick={() => void send()}
                disabled={loading || !input.trim()}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: "none",
                  background:
                    "linear-gradient(135deg, oklch(0.5038 0.2937 285.3753), oklch(0.8871 0.1828 166.5465))",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: loading || !input.trim() ? 0.4 : 1,
                  transition: "opacity 0.15s",
                  flexShrink: 0,
                }}
                aria-label="Send message"
              >
                <Send size={13} />
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
