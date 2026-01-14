export default function Page() {
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-4xl font-bold">Fast, clean mortgage quotes — without the chaos.</h1>
      <p className="text-white/70">
        RateHunter is your intake + scheduling portal. Quotes and loan specifics are handled by a licensed human;
        this site is optimized for speed, clarity, and conversion.
      </p>
      <div className="flex gap-3">
        <a href="/apply" className="rounded-2xl bg-white text-black px-4 py-2 font-medium">Apply Now</a>
        <a href="/calculator" className="rounded-2xl border border-white/20 px-4 py-2">Calculator</a>
      </div>
    </div>
  );
}
