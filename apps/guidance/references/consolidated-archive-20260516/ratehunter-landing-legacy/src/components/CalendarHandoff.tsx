"use client";

import React from "react";
import { Calendar, ArrowRight, Clock, ShieldCheck, Zap } from "lucide-react";

interface CalendarHandoffProps {
  title?: string;
  description?: string;
  calendlyUrl?: string;
  buttonText?: string;
}

export function CalendarHandoff({
  title = "Skip the wait and book a call",
  description = "Get immediate answers to your mortgage questions by scheduling a quick 10-minute discovery session.",
  calendlyUrl = "https://calendly.com/ellis-andersen-mortgage",
  buttonText = "View My Calendar",
}: CalendarHandoffProps) {
  return (
    <div className="group relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl transition-all hover:border-cyan-500/50">
      <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
        <Calendar className="w-32 h-32 text-cyan-400" />
      </div>

      <div className="relative z-10">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
          <Zap className="mr-1.5 h-3 w-3 fill-cyan-400" /> Fast-Track Process
        </div>

        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
          {title}
        </h3>

        <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-md">
          {description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="flex items-center space-x-3 text-slate-300">
            <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400">
              <Clock className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium">10-Min Discovery</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-300">
            <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium">No Obligation</span>
          </div>
        </div>

        <a
          href={calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full md:w-auto bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-cyan-500/20 active:scale-95 group/btn"
        >
          {buttonText}
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
        </a>
      </div>

      {/* Decorative corner accent */}
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-cyan-500/5 rounded-tl-full pointer-events-none" />
    </div>
  );
}
