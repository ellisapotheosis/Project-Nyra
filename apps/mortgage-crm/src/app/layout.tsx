import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mortgage CRM Dashboard",
  description: "Loan Officer Dashboard for tracking leads and applications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-100">
          {/* Sidebar Mock */}
          <aside className="w-64 bg-gray-900 text-white flex flex-col">
            <div className="p-4 text-xl font-bold border-b border-gray-800">
              Mortgage CRM
            </div>
            <nav className="flex-1 p-4 space-y-2">
              <a href="#" className="block px-4 py-2 bg-gray-800 rounded">Pipeline</a>
              <a href="#" className="block px-4 py-2 hover:bg-gray-800 rounded">Leads</a>
              <a href="#" className="block px-4 py-2 hover:bg-gray-800 rounded">Applications</a>
            </nav>
            <div className="p-4 border-t border-gray-800">
              User Profile
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <header className="h-16 bg-white border-b flex items-center px-6">
              <h1 className="text-xl font-semibold text-gray-800">Loan Officer Pipeline</h1>
            </header>
            <div className="flex-1 overflow-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
