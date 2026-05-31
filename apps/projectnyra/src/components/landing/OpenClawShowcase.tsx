"use client";

/**
 * OPENCLAW SHOWCASE — Terminal Mockup
 * Simulates a live broker/assistant conversation
 * with typewriter effect and blinking cursor.
 * Shows the assistant's capabilities and guardrails in action.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Terminal, Bot, User, Shield } from "lucide-react";

/* ─────────────────────────────────────────────────────
   Conversation script
───────────────────────────────────────────────────── */
type MessageRole = "broker" | "nyra" | "system";

interface Message {
  role: MessageRole;
  content: string;
  delay: number;  // ms from previous message
}

const SCRIPT: Message[] = [
  {
    role: "system",
    content: "Lead ingested: John M. · Purchase · $720k target · San Diego, CA · FreeRateUpdate",
    delay: 0,
  },
  {
    role: "broker",
    content: "Nyra, pull up John's status and draft a follow-up for the 3-day check-in.",
    delay: 800,
  },
  {
    role: "nyra",
    content: "John Martinez — Day 3 of Purchase track. SMS delivered Day 0 (opened). Email Day 1 (no reply). Campaign status: ACTIVE. Drafting Day 3 email now...",
    delay: 1200,
  },
  {
    role: "nyra",
    content: "Draft ready: 'Hi John, just checking in on your home purchase journey. I have a few loan scenarios I'd love to walk you through when you have 15 min.' — Shall I queue it?",
    delay: 400,
  },
  {
    role: "broker",
    content: "Queue it. Also — what rate can I quote him on a 30yr fixed?",
    delay: 700,
  },
  {
    role: "nyra",
    content: "Email queued. ⚠️ On rates: I can't quote specific rates — the Quote Engine generates compliant 3-option comparisons that go through your approval first. Want me to trigger a quote request for John?",
    delay: 900,
  },
  {
    role: "broker",
    content: "Yes, run the quote.",
    delay: 500,
  },
  {
    role: "system",
    content: "Quote Engine triggered → 3 options generated → Status: PENDING BROKER APPROVAL → Synced to Twenty CRM timeline",
    delay: 600,
  },
];

/* ─────────────────────────────────────────────────────
   Typewriter hook
───────────────────────────────────────────────────── */
function useTypewriter(text: string, active: boolean, speed = 28) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!active) return;
    setDisplayed("");
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, active, speed]);

  return displayed;
}

/* ─────────────────────────────────────────────────────
   Message bubble
───────────────────────────────────────────────────── */
function MessageBubble({
  message,
  visible,
  isLast,
}: {
  message: Message;
  visible: boolean;
  isLast: boolean;
}) {
  const text = useTypewriter(message.content, visible, 22);
  const isTyping = visible && text.length < message.content.length;

  if (!visible) return null;

  const isSystem = message.role === "system";
  const isBroker = message.role === "broker";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className={`flex gap-2.5 ${isBroker ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      {!isSystem && (
        <div
          className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border"
          style={{
            borderColor: isBroker
              ? "oklch(0.35 0.05 270 / 0.5)"
              : "oklch(0.52 0.30 270 / 0.5)",
            background: isBroker
              ? "oklch(0.12 0.03 270)"
              : "oklch(0.10 0.04 270 / 0.8)",
          }}
        >
          {isBroker
            ? <User className="h-3.5 w-3.5 text-[oklch(0.55_0.04_270)]" />
            : <Bot className="h-3.5 w-3.5 text-[oklch(0.78_0.20_195)]" />
          }
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded px-3 py-2 ${isSystem ? "w-full max-w-full" : ""}`}
        style={{
          background: isSystem
            ? "oklch(0.10 0.04 270 / 0.5)"
            : isBroker
            ? "oklch(0.14 0.04 270 / 0.8)"
            : "oklch(0.11 0.05 270 / 0.9)",
          border: isSystem
            ? "1px solid oklch(0.52 0.30 270 / 0.20)"
            : isBroker
            ? "1px solid oklch(0.28 0.06 270 / 0.5)"
            : "1px solid oklch(0.52 0.30 270 / 0.30)",
          clipPath: !isSystem
            ? "polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)"
            : "none",
        }}
      >
        {isSystem && (
          <div className="mb-1 flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-[oklch(0.52_0.30_270)]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[oklch(0.52_0.30_270)]">
              System
            </span>
          </div>
        )}

        {!isBroker && !isSystem && (
          <div className="mb-1 flex items-center gap-1.5">
            <span className="font-mono text-[9px] text-[oklch(0.78_0.20_195)]">Nyra</span>
          </div>
        )}

        <p
          className={`font-mono text-[11px] leading-relaxed ${
            isSystem
              ? "text-[oklch(0.52_0.10_270)]"
              : isBroker
              ? "text-[oklch(0.72_0.04_270)]"
              : "text-[oklch(0.78_0.03_270)]"
          }`}
        >
          {text}
          {isLast && isTyping && (
            <span
              className="ml-0.5 inline-block h-3 w-0.5 bg-[oklch(0.78_0.20_195)] align-middle"
              style={{ animation: "badge-blink 0.8s step-end infinite" }}
            />
          )}
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   Terminal window chrome
───────────────────────────────────────────────────── */
function TerminalChrome({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-[oklch(0.22_0.04_270/0.6)]"
      style={{
        background: "oklch(0.065 0.02 270)",
        boxShadow: "0 0 40px oklch(0.52 0.30 270 / 0.12), 0 24px 60px oklch(0 0 0 / 0.5)",
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 border-b border-[oklch(0.18_0.03_270/0.5)] px-4 py-2.5"
        style={{ background: "oklch(0.08 0.025 270)" }}
      >
        {/* Traffic lights */}
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[oklch(0.60_0.28_25)]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[oklch(0.70_0.22_60)]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[oklch(0.72_0.28_145)]" />
        </div>

        <div className="flex flex-1 items-center justify-center gap-2">
          <Terminal className="h-3 w-3 text-[oklch(0.42_0.06_270)]" />
          <span className="font-mono text-[10px] text-[oklch(0.40_0.04_270)]">
            nyra · openclaw · assistant
          </span>
        </div>

        {/* Live badge */}
        <div className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full bg-[oklch(0.72_0.28_145)]"
            style={{ animation: "badge-blink 1.8s ease-in-out infinite" }}
          />
          <span className="font-mono text-[9px] text-[oklch(0.45_0.06_145)]">LIVE</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[420px] overflow-y-auto p-4 scrollbar-thin">
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────────────── */
export function OpenClawShowcase() {
  const [visibleCount, setVisibleCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!inView) return;

    let idx = 0;
    const showNext = () => {
      if (idx >= SCRIPT.length) return;
      setVisibleCount((c) => c + 1);
      idx++;
      if (idx < SCRIPT.length) {
        timerRef.current = setTimeout(showNext, SCRIPT[idx].delay + SCRIPT[idx - 1].content.length * 22);
      }
    };

    timerRef.current = setTimeout(showNext, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [inView]);

  return (
    <section className="relative py-28" id="openclaw">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          {/* Left — copy */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[oklch(0.52_0.30_270)]"
            >
              AI Broker Assistant
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, type: "spring", stiffness: 90, damping: 18 }}
              className="font-[Michroma] text-4xl leading-tight text-[oklch(0.96_0.01_270)] lg:text-5xl"
            >
              OpenClaw.
              <br />
              <span
                style={{
                  color: "transparent",
                  WebkitTextStroke: "1px oklch(0.78 0.20 195)",
                  textShadow: "0 0 28px oklch(0.78 0.20 195 / 0.3)",
                }}
              >
                Your AI co-broker.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-5 font-[Electrolize] text-base leading-relaxed text-[oklch(0.55_0.04_270)]"
            >
              Nyra's AI assistant handles lead status, follow-up drafts, campaign controls, and document guidance. It calls tools — it never invents rates, approval decisions, or legal advice.
            </motion.p>

            <motion.ul
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex flex-col gap-3"
            >
              {[
                { label: "Lead qualification + status lookup",  good: true },
                { label: "Draft follow-up messages",            good: true },
                { label: "Campaign pause / resume / stop",      good: true },
                { label: "Quote rates or APRs",                 good: false },
                { label: "Make underwriting decisions",         good: false },
                { label: "Provide legal or tax advice",         good: false },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-mono text-[11px]">
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
                    style={{
                      background: item.good
                        ? "oklch(0.82 0.22 145 / 0.15)"
                        : "oklch(0.60 0.28 25 / 0.15)",
                      color: item.good
                        ? "oklch(0.82 0.22 145)"
                        : "oklch(0.70 0.26 25)",
                    }}
                  >
                    {item.good ? "✓" : "✕"}
                  </span>
                  <span
                    style={{
                      color: item.good
                        ? "oklch(0.62 0.04 270)"
                        : "oklch(0.48 0.06 25)",
                      textDecoration: item.good ? "none" : "line-through",
                    }}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Right — terminal */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 70, damping: 18, delay: 0.15 }}
          >
            <TerminalChrome>
              <div className="flex flex-col gap-3">
                {SCRIPT.map((msg, i) => (
                  <MessageBubble
                    key={i}
                    message={msg}
                    visible={i < visibleCount}
                    isLast={i === visibleCount - 1}
                  />
                ))}
              </div>
            </TerminalChrome>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
