'use client';

import Link from 'next/link';
import { ArrowRight, TrendingUp, Users, Zap, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-black/95 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-cyan-500/20 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            RateHunter
          </div>
          <div className="flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors">
              For Brokers
            </a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">
              Pricing
            </a>
            <Link href="/dashboard" className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded hover:from-cyan-500 hover:to-blue-500 transition-all">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          The Broker's Competitive Edge
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
          Real-time rate intelligence, automated lead routing, and intelligent deal management. Win more loans with data-driven decision making.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup" className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all inline-flex items-center gap-2 justify-center">
            Start Free Trial <ArrowRight size={20} />
          </Link>
          <a href="#demo" className="px-8 py-4 border border-cyan-500/30 rounded font-semibold hover:border-cyan-500 transition-all inline-flex items-center gap-2 justify-center">
            See How It Works
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
          <div>
            <p className="text-3xl font-bold text-cyan-400">3.2x</p>
            <p className="text-sm text-gray-400 mt-2">Faster deal closure</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-400">2400+</p>
            <p className="text-sm text-gray-400 mt-2">Active brokers</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-purple-400">$47B</p>
            <p className="text-sm text-gray-400 mt-2">In annual volume</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-gradient-to-b from-black/50 to-black/90">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Built for Brokers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: <TrendingUp className="text-cyan-400" size={28} />,
                title: 'Real-Time Rate Feeds',
                desc: 'Live rate updates from 50+ lenders with intelligent pricing algorithm',
              },
              {
                icon: <Users className="text-blue-400" size={28} />,
                title: 'Lead Intelligence',
                desc: 'AI-powered lead scoring and automatic routing to best loan programs',
              },
              {
                icon: <Zap className="text-purple-400" size={28} />,
                title: 'Fast Turnaround',
                desc: 'Quote to approval in hours, not days. Automated document collection',
              },
              {
                icon: <BarChart3 className="text-pink-400" size={28} />,
                title: 'Business Intelligence',
                desc: 'Dashboard metrics for conversion rates, margins, and team performance',
              },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-lg border border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-500/40 transition-all">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Brokers */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            The RateHunter Advantage
          </h2>

          <div className="space-y-8">
            {[
              {
                title: 'Smarter Rate Shopping',
                desc: 'Compare rates across all lenders in seconds. Our algorithm finds the best fit for each borrower.',
              },
              {
                title: 'Competitive Margins',
                desc: 'Real-time margin analysis shows you exactly where you stand against other brokers.',
              },
              {
                title: 'Deal Flow Intelligence',
                desc: 'See market trends, identify emerging opportunities, and adjust your strategy in real-time.',
              },
              {
                title: 'Compliance Built In',
                desc: 'Every quote is TRID-compliant. Regulatory updates happen automatically.',
              },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-lg border border-cyan-500/20 bg-black/40">
                <h3 className="text-xl font-bold text-cyan-400 mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 border-t border-cyan-500/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Transparent Pricing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: '$299',
                desc: 'Perfect for solo brokers',
                features: ['5 rate feeds', 'Basic analytics', 'Email support'],
              },
              {
                name: 'Professional',
                price: '$999',
                desc: 'For growing teams',
                features: ['All rate feeds', 'Advanced analytics', 'Priority support', 'Team management'],
                highlighted: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                desc: 'For large operations',
                features: ['Everything', 'Custom integrations', 'Dedicated support', 'SLA guarantee'],
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`p-8 rounded-lg border transition-all ${
                  plan.highlighted
                    ? 'border-cyan-400/50 bg-cyan-500/10 ring-1 ring-cyan-400/20'
                    : 'border-cyan-500/20 bg-black/40 hover:border-cyan-500/40'
                }`}
              >
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{plan.desc}</p>
                <p className="text-4xl font-bold text-cyan-400 mb-6">{plan.price}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-gray-400">
                      ✓ {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2 rounded font-semibold transition-all ${plan.highlighted ? 'bg-cyan-600 hover:bg-cyan-500' : 'border border-cyan-500/30 hover:border-cyan-500'}`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center border-t border-cyan-500/20">
        <h2 className="text-4xl font-bold mb-6">Ready to Increase Your Margins?</h2>
        <p className="text-xl text-gray-400 mb-8">Join brokers winning deals with RateHunter.</p>
        <Link href="/auth/signup" className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all inline-flex items-center gap-2">
          Start Your Free Trial <ArrowRight size={20} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 py-8 px-6 text-center text-gray-500 text-sm">
        <p>&copy; 2026 RateHunter. All rights reserved.</p>
      </footer>
    </div>
  );
}
