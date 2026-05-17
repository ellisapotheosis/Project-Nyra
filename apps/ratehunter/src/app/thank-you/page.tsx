import Link from "next/link";
import { PersonalHeader } from "@/components/PersonalHeader";
import { PersonalFooter } from "@/components/PersonalFooter";
import { CheckCircle2 } from "lucide-react";
import { CalendarHandoff } from "@/components/CalendarHandoff";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col antialiased">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(20,184,166,0.15),transparent_30%)]" />

      <PersonalHeader />

      <main className="relative flex-1 flex items-center justify-center py-24 px-6">
        <div className="max-w-3xl w-full mx-auto space-y-12 text-center animate-in fade-in zoom-in-95 duration-700">
          <div className="bg-card/40 border border-border/50 rounded-[40px] p-12 md:p-16 backdrop-blur-xl shadow-2xl border-t-2 border-t-indigo-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-turquoise-500/5 blur-3xl -z-10" />

            <div className="mx-auto w-20 h-20 bg-turquoise-500/10 text-turquoise-400 rounded-2xl flex items-center justify-center mb-10 border border-turquoise-500/20 shadow-2xl shadow-turquoise-500/10 animate-bounce duration-1000">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-foreground uppercase">
              SYNCHRONIZED!
            </h1>
            <p className="text-muted-foreground text-xl mb-0 max-w-xl mx-auto leading-relaxed font-medium uppercase tracking-tight">
              Protocol initialized. I'm running your numbers through our
              comparison engine on the 5090 worker. Expect a personalized
              analysis shortly.
            </p>
          </div>

          <CalendarHandoff
            title="FAST-TRACK_YOUR_QUOTE"
            description="Book a brief 10-minute discovery call directly on my calendar to review program options and goal alignment."
            buttonText="INITIALIZE_CALENDAR_LINK"
          />

          <div className="pt-8">
            <Link
              href="/"
              className="text-indigo-400 hover:text-turquoise-400 text-[10px] font-black uppercase tracking-[0.3em] transition-all bg-indigo-500/5 px-6 py-2 rounded-full border border-indigo-500/10 hover:border-turquoise-500/20 shadow-xl"
            >
              ← RETURN_TO_ROOT_HUB
            </Link>
          </div>
        </div>
      </main>

      <PersonalFooter />
    </div>
  );
}
