import Link from "next/link";
import { ArrowLeft, Landmark } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-2xl flex-col justify-center gap-6">
        <div className="flex items-center gap-3 text-indigo-300">
          <span className="grid size-10 place-items-center rounded-xl border border-indigo-400/20 bg-indigo-500/10">
            <Landmark className="size-5" />
          </span>
          <span className="eyebrow text-xs">RateHunter</span>
        </div>
        <div className="space-y-3">
          <h1 className="display-copy text-4xl font-black tracking-tight md:text-5xl">
            This page is not available.
          </h1>
          <p className="max-w-xl text-sm leading-6 text-white/60">
            RateHunter keeps borrower-facing mortgage guidance separate from
            internal broker and operator tools.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-indigo-100 transition hover:bg-indigo-500/20"
        >
          <ArrowLeft className="size-4" />
          Return home
        </Link>
      </section>
    </main>
  );
}
