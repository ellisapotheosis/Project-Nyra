"use client";

import React from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { Bot, ChevronDown, ArrowRight } from "lucide-react";
import { Button, Badge } from "@nyra/ui";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn } from "@/lib/utils";

export function RevealHero() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const opacity = useTransform(scrollYProgress, [0, 0.16], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.16], [1, 0.94]);
  const revealOpacity = useTransform(scrollYProgress, [0.08, 0.24], [0, 1]);
  const revealY = useTransform(scrollYProgress, [0.08, 0.24], [32, 0]);

  return (
    <div className="relative min-h-[200vh] bg-black">
      {/* Fixed Header with Login Button */}
      <div className="fixed top-0 left-0 right-0 z-[100] flex justify-between items-center px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-2xl border border-indigo-400/30">
            <Bot className="size-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase italic">
            Project_Nyra
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <Link href="/auth/login">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-[10px] px-8 h-11 rounded-xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
              LOGIN_PORTAL
            </Button>
          </Link>
        </div>
      </div>

      {/* Initial Hero - "Black screen with writing" */}
      <section className="sticky top-0 h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <motion.div style={{ opacity, scale }} className="space-y-8">
          <Badge
            variant="outline"
            className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-4 py-1.5 font-black text-[10px] uppercase tracking-[0.5em] mb-4"
          >
            INITIATING_SEQUENCE
          </Badge>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase leading-[0.85]">
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-turquoise-400">
              Mortgage Orchestration
            </span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl mx-auto uppercase tracking-widest opacity-60">
            Scroll to reveal the neural command layer.
          </p>
          <motion.div
            animate={prefersReducedMotion ? undefined : { y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            className="pt-12"
          >
            <ChevronDown className="size-8 text-indigo-400 mx-auto opacity-40" />
          </motion.div>
        </motion.div>
      </section>

      {/* Revealed Content */}
      <motion.section
        style={{ opacity: revealOpacity, y: revealY }}
        className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24 space-y-32"
      >
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic leading-none">
              Decentralized <br />
              Intelligence.
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed font-medium uppercase tracking-tight">
              Project Nyra is a distributed AI ecosystem designed for elite
              mortgage brokers. Synchronize your leads, quotes, and campaigns
              across a high-performance GPU cluster.
            </p>
            <div className="flex gap-4">
              <Link href="/auth/signup">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-[11px] px-10 h-14 rounded-2xl shadow-2xl shadow-indigo-500/30 group">
                  GET_STARTED{" "}
                  <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative aspect-square">
            <div className="absolute inset-8 bg-indigo-500/18 blur-[88px] rounded-full motion-safe:animate-pulse" />
            <div className="relative z-10 border border-indigo-500/30 bg-card/40 backdrop-blur-3xl rounded-[48px] p-8 shadow-2xl h-full flex flex-col justify-center items-center text-center space-y-6">
              <Bot className="size-24 text-indigo-400" />
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                Neural_Node_Active
              </h3>
              <div className="w-full h-1 bg-indigo-500/10 rounded-full overflow-hidden">
                <motion.div
                  animate={
                    prefersReducedMotion ? undefined : { x: ["-100%", "100%"] }
                  }
                  transition={{
                    repeat: Infinity,
                    duration: 3.6,
                    ease: "linear",
                  }}
                  className="h-full w-1/3 bg-indigo-500"
                />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
                Ready for Operator Command
              </p>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            title="DETERMINISTIC_PRICING"
            desc="Scenario-aware quote engine running on private VLLM instances."
          />
          <FeatureCard
            title="LEAD_AUTONOMY"
            desc="Automated follow-up and nurture sequences via Activepieces runtime."
          />
          <FeatureCard
            title="COGNITIVE_RECALL"
            desc="Infinite context memory for every borrower conversation and file."
          />
        </div>
      </motion.section>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-8 rounded-[32px] border border-indigo-500/10 bg-card/20 backdrop-blur-xl hover:border-indigo-500/30 transition-all group">
      <h3 className="text-lg font-black text-white uppercase tracking-tight mb-4 group-hover:text-indigo-400 transition-colors italic">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed font-medium uppercase tracking-tight opacity-70">
        {desc}
      </p>
    </div>
  );
}
