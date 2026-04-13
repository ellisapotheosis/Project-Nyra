'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingDown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getRates } from '@/lib/api/rates';

export function RatesSection() {
  const { data: rates, isLoading } = useQuery({
    queryKey: ['rates'],
    queryFn: getRates,
  });

  return (
    <section className="py-20" id="rates">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            <TrendingDown className="mr-2 h-4 w-4" />
            Today's Best Rates
          </div>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Current Mortgage Rates
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Compare rates from multiple lenders and find your best match
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-lg bg-gray-200"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {rates?.map((rate, index) => (
              <motion.div
                key={rate.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {rate.loanType}
                  </h3>
                  <p className="text-sm text-gray-600">{rate.term}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-blue-600">
                      {rate.rate}%
                    </span>
                    <span className="ml-2 text-sm text-gray-600">APR</span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <Clock className="mr-1 h-4 w-4" />
                    Updated {rate.updatedAt}
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Payment</span>
                    <span className="font-semibold">${rate.monthlyPayment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">APR</span>
                    <span className="font-semibold">{rate.apr}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Points</span>
                    <span className="font-semibold">{rate.points}</span>
                  </div>
                </div>

                <Button className="mt-6 w-full" variant="outline">
                  View Details
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button size="lg">View All Rates</Button>
          <p className="mt-4 text-sm text-gray-600">
            Rates updated daily. All rates subject to change without notice.
          </p>
        </div>
      </div>
    </section>
  );
}
