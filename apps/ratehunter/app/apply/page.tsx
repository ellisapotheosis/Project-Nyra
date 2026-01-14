export default function Page() {
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-3xl font-semibold">Apply</h1>
      <p className="text-white/70">
        Intake only. No loan advice or commitments. We’ll follow up to collect documents and schedule a call.
      </p>
      <form className="space-y-3">
        <input className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2" placeholder="Full name" />
        <input className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2" placeholder="Email" />
        <input className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2" placeholder="Phone" />
        <button className="rounded-2xl bg-white text-black px-4 py-2 font-medium" type="button">
          Submit (wire to Orchestrator)
        </button>
      </form>
    </div>
  );
}
