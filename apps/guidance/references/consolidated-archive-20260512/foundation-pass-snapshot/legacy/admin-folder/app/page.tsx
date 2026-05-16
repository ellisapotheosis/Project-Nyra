export default function AdminHome() {
  return (
    <main className="min-h-screen bg-black text-white p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="border-b border-white/10 pb-8">
           <p className="text-turquoise-400 text-[10px] font-black tracking-[0.2em] uppercase mb-2">Central_Control</p>
           <h1 className="text-5xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-indigo-500 to-turquoise-400 bg-clip-text text-transparent">Nyra Admin</h1>
           <p className="text-muted-foreground mt-4 font-medium uppercase tracking-tight text-sm">System Registry & Global Orchestration Overrides</p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          {[
            { label: "Campaign Builder", status: "READY" },
            { label: "Campaign Monitor", status: "ACTIVE" },
            { label: "Lead Timeline", status: "SYNCING" },
            { label: "Quote Approvals", status: "PENDING" },
            { label: "Worker Status", status: "HEALTHY" }
          ].map(item => (
            <div key={item.label} className="group p-6 rounded-3xl border border-white/5 bg-white/5 hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all cursor-pointer shadow-2xl border-l-2 border-l-indigo-500">
               <div className="flex justify-between items-start">
                 <p className="text-lg font-black uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{item.label}</p>
                 <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-turquoise-500/10 text-turquoise-400 border border-turquoise-500/20">{item.status}</span>
               </div>
            </div>
          ))}
        </div>

        <footer className="pt-12 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-30">
          Project Nyra Foundation · Mission Control v1.0
        </footer>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
        :root { --font-inter: 'Inter', sans-serif; }
        .text-muted-foreground { color: rgba(255,255,255,0.4); }
        .text-turquoise-400 { color: oklch(0.75 0.15 180); }
      `}</style>
    </main>
  );
}
