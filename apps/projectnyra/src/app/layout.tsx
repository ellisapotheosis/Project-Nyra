import type { Metadata } from "next";
import { ToastProvider, ThemeProvider, ErrorBoundary } from "@nyra/ui";
import { AuthProvider } from "@/lib/auth-context";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Nyra - Mortgage Automation",
  description: "AI-powered mortgage operations platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-black text-white m-0 p-0 font-sans antialiased">
        <ErrorBoundary>
          <AuthProvider>
            <ThemeProvider>
              <ToastProvider>{children}</ToastProvider>
            </ThemeProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
