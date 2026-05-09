import Link from 'next/link';
import { PersonalHeader } from '@/components/PersonalHeader';
import { PersonalFooter } from '@/components/PersonalFooter';
import { CheckCircle2, Calendar, ArrowRight } from 'lucide-react';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.2),transparent_30%)]" />

      <PersonalHeader />

      <main className="relative flex-1 flex items-center justify-center py-20 px-6">
        <div className="max-w-2xl w-full mx-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-8 md:p-12 backdrop-blur shadow-2xl text-center">
          <div className="mx-auto w-16 h-16 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-4">You're All Set!</h1>
          <p className="text-slate-300 text-lg mb-10 max-w-lg mx-auto">
            Your request has been received. I'm running your numbers through our comparison engine right now. I will reach out to you shortly.
          </p>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-left">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-cyan-400" /> Fast-Track Your Quote
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Don't want to wait? Book a 10-minute discovery call with me directly on my calendar so we can review your options together.
            </p>
            <a 
              href="https://calendly.com/ellis-andersen-mortgage" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl transition-colors"
            >
              Book 10-Minute Call <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>

          <div className="mt-8">
            <Link href="/" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
              ← Return to Home
            </Link>
          </div>
        </div>
      </main>

      <PersonalFooter />
    </div>
  );
}
