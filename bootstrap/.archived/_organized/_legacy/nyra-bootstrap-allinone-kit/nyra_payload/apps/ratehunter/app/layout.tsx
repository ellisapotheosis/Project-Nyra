import "@/styles/globals.css";
import Link from "next/link";

export const metadata = { title: "RateHunter.net" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="px-6 py-4 flex items-center justify-between border-b border-white/10">
          <div className="font-semibold">RateHunter.net</div>
          <nav className="flex gap-4 text-sm">
            <Link href="/">Home</Link>
            <Link href="/rates">Rates</Link>
            <Link href="/calculator">Calculator</Link>
            <Link href="/apply">Apply</Link>
          </nav>
        </header>
        <main className="px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
