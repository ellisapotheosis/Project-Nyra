import React from 'react';
import { Calendar, CheckCircle2, ArrowRight, Zap } from 'lucide-react';

interface CalendarHandoffProps {
  title?: string;
  description?: string;
  buttonText?: string;
}

export function CalendarHandoff({
  title = "Ready to take the next step?",
  description = "Schedule a consultation to review your numbers.",
  buttonText = "Book Discovery Call"
}: CalendarHandoffProps) {
  return (
    <div className="group relative overflow-hidden bg-card/40 border border-border/50 rounded-[32px] p-10 shadow-2xl transition-all hover:border-indigo-500/30 backdrop-blur-xl border-t-2 border-t-turquoise-500">
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-turquoise-500/5 blur-3xl group-hover:bg-turquoise-500/10 transition-all" />

      <div className="relative flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 text-center md:text-left space-y-6">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="p-2 rounded-lg bg-turquoise-500/10 border border-turquoise-500/20 text-turquoise-400">
              <Calendar className="size-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-turquoise-400">CALENDAR_HANDOFF_PROTOCOL</span>
          </div>
          <div>
            <h2 className="text-3xl font-black text-foreground uppercase tracking-tight leading-none mb-3">{title}</h2>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-md uppercase tracking-tight">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            {["10-Minute Sync", "No Obligations", "Live Scenario Review"].map((perk) => (
              <div key={perk} className="flex items-center gap-2 rounded-xl bg-indigo-500/5 border border-indigo-500/10 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-indigo-300">
                <div className="size-1 rounded-full bg-indigo-500" />
                {perk}
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0 w-full md:w-auto">
          <a
            href="https://calendly.com/ellis-andersen"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full md:w-auto h-16 items-center justify-center px-10 rounded-2xl bg-turquoise-600 hover:bg-turquoise-500 text-black font-black uppercase tracking-[0.2em] shadow-2xl shadow-turquoise-500/20 transition-all active:scale-95 group-hover:scale-105"
          >
            <Zap className="mr-3 size-5 fill-current" />
            {buttonText}
            <ArrowRight className="ml-3 size-5" />
          </a>
          <p className="text-center mt-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">AUTO_CONFIRM_ACTIVE</p>
        </div>
      </div>
    </div>
  );
}
