'use client';

import { ArrowRight, TrendingDown, Shield, Clock } from 'lucide-react';

export function Hero() {
  const scrollToQuote = () => {
    document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      <div className="relative container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Find Your Perfect
            <span className="block text-primary-200">Mortgage Rate</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Compare personalized rates from top lenders in seconds. 
            <span className="block mt-2">No credit impact. No obligations.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={scrollToQuote}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-white text-primary-700 rounded-lg hover:bg-primary-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-primary-800/50 text-white rounded-lg hover:bg-primary-800 transition-all border-2 border-white/20">
              Learn More
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="flex items-center justify-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
              <TrendingDown className="h-8 w-8 text-primary-200" />
              <div className="text-left">
                <div className="text-2xl font-bold">6.875%</div>
                <div className="text-sm text-primary-200">Average Rate</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
              <Shield className="h-8 w-8 text-primary-200" />
              <div className="text-left">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm text-primary-200">Secure & Private</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
              <Clock className="h-8 w-8 text-primary-200" />
              <div className="text-left">
                <div className="text-2xl font-bold">60 sec</div>
                <div className="text-sm text-primary-200">Get Your Quote</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
