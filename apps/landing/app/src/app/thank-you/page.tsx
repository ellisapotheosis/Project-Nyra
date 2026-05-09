import Link from 'next/link';
import { PersonalHeader } from '@/components/PersonalHeader';
import { PersonalFooter } from '@/components/PersonalFooter';
import { CheckCircle2 } from 'lucide-react';
import { CalendarHandoff } from '@/components/CalendarHandoff';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.2),transparent_30%)]" />

      <PersonalHeader />

      <main className="relative flex-1 flex items-center justify-center py-20 px-6">
        <div className="max-w-3xl w-full mx-auto space-y-12 text-center">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 md:p-12 backdrop-blur shadow-2xl">
            <div className="mx-auto w-16 h-16 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center mb-6 border border-cyan-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white">You're all set!</h1>
            <p className="text-slate-300 text-lg mb-0 max-w-xl mx-auto leading-relaxed">
              Your request has been received. I'm running your numbers through our comparison engine right now. I will reach out to you shortly with a personalized analysis.
            </p>
          </div>

          <CalendarHandoff 
            title="Want to fast-track your quote?"
            description="Book a brief 10-minute discovery call with me directly on my calendar so we can review your options together and find the best program for your goals."
            buttonText="Book 10-Minute Call"
          />

          <div className="pt-4">
            <Link href="/" className="text-slate-500 hover:text-cyan-400 text-xs font-bold uppercase tracking-widest transition-colors">
              ← Return to Home
            </Link>
          </div>
        </div>
      </main>

      <PersonalFooter />
    </div>
  );
}
