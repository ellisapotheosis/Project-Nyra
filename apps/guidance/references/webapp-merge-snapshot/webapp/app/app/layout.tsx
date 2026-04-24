import type { Metadata } from "next";
import { ClerkProvider, SignInButton, UserButton } from '@clerk/nextjs';
import "./globals.css";
import Link from 'next/link';
import { Geist } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nyra Mortgage Assistant",
  description: "AI-powered mortgage lead management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geist.className} antialiased`}>
          <header className="border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href="/" className="text-xl font-bold text-blue-600">Nyra Mortgage</Link>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                  <Link href="/assistant" className="hover:text-blue-600 transition-colors">AI Assistant</Link>
                  <Link href="/campaigns" className="hover:text-blue-600 transition-colors">Campaigns</Link>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Sign In</button>
                </SignInButton>
                <UserButton  />
              </div>
            </div>
          </header>
          <main>
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
