import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RateHunterLogo } from "@/components/icons/ratehunter-logo";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Bell,
  Search,
  Plus
} from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RateHunter CRM",
  description: "Enterprise Mortgage CRM powered by Nyra AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
            <div className="p-6">
              <RateHunterLogo />
            </div>

            <nav className="flex-1 px-4 space-y-1">
              <SidebarItem icon={<LayoutDashboard size={20} />} label="Pipeline" active />
              <SidebarItem icon={<Users size={20} />} label="Leads" />
              <SidebarItem icon={<FileText size={20} />} label="Applications" />
              <SidebarItem icon={<Settings size={20} />} label="Settings" />
            </nav>

            <div className="p-4 border-t border-slate-100">
              <div className="flex items-center space-x-3 px-2 py-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                  EA
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Ellis Andersen</p>
                  <p className="text-xs text-slate-500 truncate">Loan Officer</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
              <div className="relative w-96 max-w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search leads, applications, documents..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:border-blue-500 transition-all outline-none"
                  suppressHydrationWarning
                />
              </div>

              <div className="flex items-center space-x-4">
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                  <Plus size={18} />
                  <span>New Lead</span>
                </button>
              </div>
            </header>

            {/* Viewport */}
            <div className="flex-1 overflow-auto p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

function SidebarItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <a
      href="#"
      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-blue-50 text-blue-600"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}
