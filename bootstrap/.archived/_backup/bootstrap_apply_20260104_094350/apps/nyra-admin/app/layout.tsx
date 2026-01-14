import "@/styles/globals.css";
import Link from "next/link";

export const metadata = { title: "Nyra Admin" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <div className="min-h-screen grid grid-cols-[260px_1fr]">
          <aside className="border-r bg-white p-4">
            <div className="font-semibold text-lg">Nyra Admin</div>
            <nav className="mt-6 flex flex-col gap-2 text-sm">
              <Link href="/" className="hover:underline">Dashboard</Link>
              <Link href="/leads" className="hover:underline">Leads</Link>
              <Link href="/campaigns" className="hover:underline">Campaigns</Link>
              <Link href="/quotes" className="hover:underline">Quotes</Link>
              <Link href="/chat" className="hover:underline">Chat</Link>
              <Link href="/audit" className="hover:underline">Audit</Link>
            </nav>
          </aside>
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
