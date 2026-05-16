'use client'

import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { LoginForm } from '@/components/auth/LoginForm'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthenticatedLayout>
        {children}
      </AuthenticatedLayout>
    </AuthProvider>
  )
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-violet-400 animate-pulse"></div>
          <p className="text-slate-400">Loading Nyra Dashboard...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-slate-950/30 p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}