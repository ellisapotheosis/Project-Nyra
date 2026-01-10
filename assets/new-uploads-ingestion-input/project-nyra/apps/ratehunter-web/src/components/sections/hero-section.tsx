'use client';

import { motion } from 'framer-motion';
import { ArrowRight, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeadCaptureForm } from '@/components/forms/lead-capture-form';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center"
          >
            <div className="mb-4 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
              <TrendingDown className="mr-2 h-4 w-4" />
              Rates as low as 6.25% APR
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Find Your Best
              <span className="block text-blue-600">Mortgage Rate</span>
              in Minutes
            </h1>

            <p className="mb-8 text-lg text-gray-600">
              Compare rates from top lenders instantly. Our AI-powered platform
              matches you with the perfect mortgage based on your unique
              financial profile.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="group">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline">
                View Current Rates
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t pt-8">
              <div>
                <div className="text-2xl font-bold text-gray-900">$2.5B+</div>
                <div className="text-sm text-gray-600">Loans Funded</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">50K+</div>
                <div className="text-sm text-gray-600">Happy Homeowners</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">4.9/5</div>
                <div className="text-sm text-gray-600">Customer Rating</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Lead Capture Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center"
          >
            <LeadCaptureForm />
          </motion.div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="hero-pattern"
              width={200}
              height={200}
              x="50%"
              y={-1}
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth={0} fill="url(#hero-pattern)" />
        </svg>
      </div>
    </section>
  );
}
