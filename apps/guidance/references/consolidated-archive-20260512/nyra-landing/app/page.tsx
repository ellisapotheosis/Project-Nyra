'use client';

import Link from 'next/link';
import { ArrowRight, Zap, Shield, BarChart3, Cpu } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-black/95 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-purple-500/20 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Nyra
          </div>
          <div className="flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">
              How it Works
            </a>
            <Link href="/auth/login" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded hover:from-purple-500 hover:to-pink-500 transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
          AI-Powered Mortgage Automation
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
          Accelerate your mortgage operations with intelligent automation. From lead processing to compliance, Nyra handles it all with precision and speed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded font-semibold hover:from-purple-500 hover:to-pink-500 transition-all inline-flex items-center gap-2 justify-center">
            Get Started <ArrowRight size={20} />
          </Link>
          <a href="#demo" className="px-8 py-4 border border-purple-500/30 rounded font-semibold hover:border-purple-500 transition-all inline-flex items-center gap-2 justify-center">
            Watch Demo
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
          <div>
            <p className="text-3xl font-bold text-cyan-400">80%</p>
            <p className="text-sm text-gray-400 mt-2">Manual work reduction</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-pink-400">24h</p>
            <p className="text-sm text-gray-400 mt-2">Lead-to-close acceleration</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-purple-400">99.8%</p>
            <p className="text-sm text-gray-400 mt-2">Compliance accuracy</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-gradient-to-b from-black/50 to-black/90">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Powerful Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: <Zap className="text-cyan-400" size={28} />,
                title: 'Real-Time Processing',
                desc: 'Instant lead processing and quote generation with AI-powered decision making',
              },
              {
                icon: <Shield className="text-green-400" size={28} />,
                title: 'Compliance Built-In',
                desc: 'Automatic TILA, RESPA, and TRID compliance checking on every transaction',
              },
              {
                icon: <BarChart3 className="text-pink-400" size={28} />,
                title: 'Advanced Analytics',
                desc: 'Deep insights into pipeline health, conversion rates, and team performance',
              },
              {
                icon: <Cpu className="text-purple-400" size={28} />,
                title: 'GPU-Powered AI',
                desc: 'Enterprise-grade AI models running locally for speed and data privacy',
              },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-lg border border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40 transition-all">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
            How It Works
          </h2>

          <div className="space-y-8">
            {[
              { step: 1, title: 'Lead Ingestion', desc: 'Leads flow in from multiple sources and are automatically validated' },
              { step: 2, title: 'Compliance Check', desc: 'AI analyzes each lead against regulatory requirements' },
              { step: 3, title: 'Quote Generation', desc: 'Intelligent quote engine calculates optimal loan terms' },
              { step: 4, title: 'Automation', desc: 'Workflows orchestrate follow-ups, documentation, and closing' },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center border-t border-purple-500/20">
        <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Mortgage Operations?</h2>
        <p className="text-xl text-gray-400 mb-8">Join leading mortgage brokers using Nyra to close deals faster.</p>
        <Link href="/auth/signup" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded font-semibold hover:from-purple-500 hover:to-pink-500 transition-all inline-flex items-center gap-2">
          Start Free Trial <ArrowRight size={20} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 py-8 px-6 text-center text-gray-500 text-sm">
        <p>&copy; 2026 Nyra Mortgage Automation. All rights reserved.</p>
      </footer>
    </div>
  );
}
