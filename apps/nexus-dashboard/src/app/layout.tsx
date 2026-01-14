import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nexus Router Dashboard',
  description: 'AI Orchestration Platform - Monitor and manage your MCP servers, GPU workers, and model routes',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden">
          <aside className="w-64 flex-shrink-0">
            <Sidebar />
          </aside>
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="container mx-auto p-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
