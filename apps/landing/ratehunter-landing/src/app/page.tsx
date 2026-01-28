'use client';

import { useState, useEffect } from 'react';

// Rate data type
interface MortgageRate {
  type: string;
  rate: number;
  apr: number;
  change: number;
}

// Feature card type
interface Feature {
  icon: string;
  title: string;
  description: string;
}

// Today's mock rates (would be fetched from API in production)
const todaysRates: MortgageRate[] = [
  { type: '30-Year Fixed', rate: 6.875, apr: 6.95, change: -0.125 },
  { type: '15-Year Fixed', rate: 5.99, apr: 6.05, change: -0.0625 },
  { type: '5/1 ARM', rate: 6.25, apr: 7.15, change: 0.0 },
  { type: '7/1 ARM', rate: 6.375, apr: 7.0, change: -0.0625 },
  { type: 'FHA 30-Year', rate: 6.5, apr: 7.25, change: -0.125 },
  { type: 'VA 30-Year', rate: 6.125, apr: 6.35, change: -0.0625 },
];

const features: Feature[] = [
  {
    icon: '🎯',
    title: 'Personalized Rates',
    description: 'Get rates tailored to your credit score, location, and loan amount.',
  },
  {
    icon: '⚡',
    title: 'Instant Comparison',
    description: 'Compare rates from 50+ lenders in seconds, not hours.',
  },
  {
    icon: '🔒',
    title: 'Bank-Level Security',
    description: '256-bit encryption protects your personal information.',
  },
  {
    icon: '💰',
    title: 'Save Thousands',
    description: 'Our users save an average of $3,200 over the life of their loan.',
  },
  {
    icon: '📊',
    title: 'Transparent Fees',
    description: 'See all costs upfront with no hidden fees or surprises.',
  },
  {
    icon: '🤝',
    title: 'Expert Support',
    description: 'Access to licensed mortgage advisors 7 days a week.',
  },
];

const testimonials = [
  {
    name: 'Sarah M.',
    location: 'Austin, TX',
    quote: 'RateHunter saved me $350/month on my mortgage! The comparison tool made it so easy.',
    rating: 5,
  },
  {
    name: 'David K.',
    location: 'Denver, CO',
    quote: 'I was able to compare 15 lenders in under 5 minutes. Game changer!',
    rating: 5,
  },
  {
    name: 'Jennifer R.',
    location: 'Phoenix, AZ',
    quote: 'The pre-approval process was seamless. Closed in just 21 days!',
    rating: 5,
  },
];

export default function Home() {
  const [loanAmount, setLoanAmount] = useState<string>('400000');
  const [downPayment, setDownPayment] = useState<string>('80000');
  const [creditScore, setCreditScore] = useState<string>('740');
  const [zipCode, setZipCode] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    // Update time for rate freshness indicator
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: string) => {
    const num = parseInt(value.replace(/,/g, ''), 10);
    if (isNaN(num) || num < 0) return '0';
    return num.toLocaleString('en-US');
  };

  const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setLoanAmount(value);
  };

  const handleDownPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setDownPayment(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎯</span>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                RateHunter
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#rates" className="text-slate-600 hover:text-indigo-600 transition">
                Today&apos;s Rates
              </a>
              <a href="#how-it-works" className="text-slate-600 hover:text-indigo-600 transition">
                How It Works
              </a>
              <a href="#calculator" className="text-slate-600 hover:text-indigo-600 transition">
                Calculator
              </a>
              <a
                href="#get-started"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-full font-medium hover:shadow-lg hover:shadow-indigo-200 transition"
              >
                Get Your Rate
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
              Rates updated {currentTime || 'live'}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Find the{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Best Mortgage Rate
              </span>
              <br />
              in Minutes, Not Days
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10">
              Compare personalized rates from 50+ top lenders. Our AI-powered platform finds you the
              lowest rate based on your unique financial profile.
            </p>

            {/* Quick Quote Form */}
            <div
              id="get-started"
              className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Home Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      $
                    </span>
                    <input
                      type="text"
                      value={formatCurrency(loanAmount)}
                      onChange={handleLoanAmountChange}
                      className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="400,000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Down Payment
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      $
                    </span>
                    <input
                      type="text"
                      value={formatCurrency(downPayment)}
                      onChange={handleDownPaymentChange}
                      className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="80,000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Credit Score
                  </label>
                  <select
                    value={creditScore}
                    onChange={(e) => setCreditScore(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none bg-white"
                  >
                    <option value="760">Excellent (760+)</option>
                    <option value="740">Very Good (740-759)</option>
                    <option value="720">Good (720-739)</option>
                    <option value="700">Fair (700-719)</option>
                    <option value="680">Below 700</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Enter ZIP"
                    maxLength={5}
                  />
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  // Validate inputs
                  if (!zipCode || zipCode.length < 5) {
                    alert('Please enter a valid 5-digit ZIP code');
                    return;
                  }
                  // In production, this would submit to an API
                  alert(`🎯 Finding personalized rates for ZIP ${zipCode}...\n\nLoan: $${formatCurrency(loanAmount)}\nDown Payment: $${formatCurrency(downPayment)}\nCredit Score: ${creditScore}+\n\n(Demo mode - API integration coming soon!)`);
                }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-indigo-200 transition transform hover:-translate-y-0.5"
              >
                🎯 See My Personalized Rates
              </button>
              <p className="text-sm text-slate-500 mt-4 text-center">
                No SSN required • No impact to credit score • 100% free
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Today's Rates Section */}
      <section id="rates" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Today&apos;s Mortgage Rates
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Updated every 15 minutes. Rates shown are national averages for borrowers with
              excellent credit (740+).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todaysRates.map((rate, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg shadow-slate-100 hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-slate-900">{rate.type}</h3>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded ${
                      rate.change < 0
                        ? 'bg-green-100 text-green-700'
                        : rate.change > 0
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {rate.change > 0 ? '+' : ''}
                    {rate.change.toFixed(3)}%
                  </span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-indigo-600">{rate.rate.toFixed(3)}%</span>
                  <span className="text-slate-500">Rate</span>
                </div>
                <div className="mt-2 text-slate-600">
                  <span className="font-medium">{rate.apr.toFixed(3)}%</span> APR
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-slate-500 mt-8">
            Rates are subject to change and may vary based on credit score, loan amount, and other
            factors.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Why Choose RateHunter?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              We&apos;ve helped over 100,000 homebuyers find their perfect mortgage rate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-indigo-100 max-w-2xl mx-auto">
              See what our customers are saying about their experience with RateHunter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-white mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-indigo-200 text-sm">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Mortgage Calculator
            </h2>
            <p className="text-slate-600">
              Estimate your monthly payment based on today&apos;s rates.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Loan Amount: ${formatCurrency(loanAmount)}
                    </label>
                    <input
                      type="range"
                      min="50000"
                      max="2000000"
                      step="10000"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Down Payment: ${formatCurrency(downPayment)} (
                      {((parseInt(downPayment) / parseInt(loanAmount)) * 100 || 0).toFixed(1)}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={loanAmount}
                      step="5000"
                      value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value)}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center items-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
                <p className="text-slate-600 mb-2">Estimated Monthly Payment</p>
                <p className="text-5xl font-bold text-indigo-600">
                  $
                  {(() => {
                    // Use the 30-Year Fixed rate from todaysRates
                    const rate30Year = todaysRates.find(r => r.type === '30-Year Fixed')?.rate || 6.875;
                    const monthlyRate = rate30Year / 100 / 12;
                    const principal = parseInt(loanAmount) - parseInt(downPayment);
                    const numPayments = 360; // 30 years
                    
                    // Handle edge cases
                    if (principal <= 0 || isNaN(principal)) {
                      return '0';
                    }
                    
                    // Standard mortgage payment formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
                    const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                      (Math.pow(1 + monthlyRate, numPayments) - 1);
                    
                    return Math.round(payment).toLocaleString();
                  })()}
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Principal & Interest @ {todaysRates.find(r => r.type === '30-Year Fixed')?.rate || 6.875}% (30-Year Fixed)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
            Ready to Find Your Rate?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Join over 100,000 homebuyers who found their perfect mortgage with RateHunter.
          </p>
          <a
            href="#get-started"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-indigo-200 transition transform hover:-translate-y-0.5"
          >
            🎯 Get Your Free Rate Quote
          </a>
          <p className="text-sm text-slate-500 mt-4">
            No SSN required • No impact to credit score • Results in 60 seconds
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🎯</span>
                <span className="text-xl font-bold">RateHunter</span>
              </div>
              <p className="text-slate-400">
                Helping Americans find the best mortgage rates since 2024.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Purchase Loans</a></li>
                <li><a href="#" className="hover:text-white transition">Refinance</a></li>
                <li><a href="#" className="hover:text-white transition">Home Equity</a></li>
                <li><a href="#" className="hover:text-white transition">Pre-Approval</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Mortgage Calculator</a></li>
                <li><a href="#" className="hover:text-white transition">Affordability Calculator</a></li>
                <li><a href="#" className="hover:text-white transition">Rate Trends</a></li>
                <li><a href="#" className="hover:text-white transition">Buyer&apos;s Guide</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p className="mb-4">
              RateHunter is not a lender. We connect you with lenders who may be able to provide
              quotes for mortgage loans. Your actual rate and terms will depend on the lender,
              property, and your credit qualifications.
            </p>
            <p>© {new Date().getFullYear()} RateHunter. All rights reserved. NMLS #1234567</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
