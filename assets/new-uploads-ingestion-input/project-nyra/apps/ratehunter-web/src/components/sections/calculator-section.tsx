'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { calculateMonthlyPayment, calculateAffordability } from '@/lib/utils/calculator';

export function CalculatorSection() {
  const [paymentInputs, setPaymentInputs] = useState({
    homePrice: '500000',
    downPayment: '100000',
    interestRate: '6.5',
    loanTerm: '30',
  });

  const [affordabilityInputs, setAffordabilityInputs] = useState({
    annualIncome: '120000',
    monthlyDebts: '2000',
    downPayment: '100000',
    interestRate: '6.5',
  });

  const monthlyPayment = calculateMonthlyPayment(
    Number(paymentInputs.homePrice) - Number(paymentInputs.downPayment),
    Number(paymentInputs.interestRate) / 100 / 12,
    Number(paymentInputs.loanTerm) * 12
  );

  const affordability = calculateAffordability(
    Number(affordabilityInputs.annualIncome),
    Number(affordabilityInputs.monthlyDebts),
    Number(affordabilityInputs.downPayment),
    Number(affordabilityInputs.interestRate) / 100 / 12
  );

  return (
    <section className="bg-gray-50 py-20" id="calculator">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            <Calculator className="mr-2 h-4 w-4" />
            Mortgage Calculators
          </div>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Calculate Your Numbers
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Use our calculators to estimate your monthly payment or how much you can afford
          </p>
        </motion.div>

        <Tabs defaultValue="payment" className="mx-auto max-w-4xl">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payment">Monthly Payment</TabsTrigger>
            <TabsTrigger value="affordability">Affordability</TabsTrigger>
          </TabsList>

          <TabsContent value="payment" className="mt-6">
            <div className="rounded-lg bg-white p-8 shadow-lg">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="homePrice">Home Price</Label>
                    <Input
                      id="homePrice"
                      type="number"
                      value={paymentInputs.homePrice}
                      onChange={(e) =>
                        setPaymentInputs({ ...paymentInputs, homePrice: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="downPayment">Down Payment</Label>
                    <Input
                      id="downPayment"
                      type="number"
                      value={paymentInputs.downPayment}
                      onChange={(e) =>
                        setPaymentInputs({ ...paymentInputs, downPayment: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.01"
                      value={paymentInputs.interestRate}
                      onChange={(e) =>
                        setPaymentInputs({ ...paymentInputs, interestRate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="loanTerm">Loan Term (years)</Label>
                    <Input
                      id="loanTerm"
                      type="number"
                      value={paymentInputs.loanTerm}
                      onChange={(e) =>
                        setPaymentInputs({ ...paymentInputs, loanTerm: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-center rounded-lg bg-blue-50 p-8">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">
                      Estimated Monthly Payment
                    </p>
                    <p className="mt-2 text-4xl font-bold text-blue-600">
                      ${monthlyPayment.toLocaleString()}
                    </p>
                    <div className="mt-6 space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Principal & Interest:</span>
                        <span className="font-semibold">${monthlyPayment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Property Tax (est.):</span>
                        <span className="font-semibold">
                          ${Math.round((Number(paymentInputs.homePrice) * 0.01) / 12).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Home Insurance (est.):</span>
                        <span className="font-semibold">
                          ${Math.round((Number(paymentInputs.homePrice) * 0.003) / 12).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="affordability" className="mt-6">
            <div className="rounded-lg bg-white p-8 shadow-lg">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="annualIncome">Annual Income</Label>
                    <Input
                      id="annualIncome"
                      type="number"
                      value={affordabilityInputs.annualIncome}
                      onChange={(e) =>
                        setAffordabilityInputs({
                          ...affordabilityInputs,
                          annualIncome: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyDebts">Monthly Debts</Label>
                    <Input
                      id="monthlyDebts"
                      type="number"
                      value={affordabilityInputs.monthlyDebts}
                      onChange={(e) =>
                        setAffordabilityInputs({
                          ...affordabilityInputs,
                          monthlyDebts: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="downPaymentAff">Down Payment</Label>
                    <Input
                      id="downPaymentAff"
                      type="number"
                      value={affordabilityInputs.downPayment}
                      onChange={(e) =>
                        setAffordabilityInputs({
                          ...affordabilityInputs,
                          downPayment: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="interestRateAff">Interest Rate (%)</Label>
                    <Input
                      id="interestRateAff"
                      type="number"
                      step="0.01"
                      value={affordabilityInputs.interestRate}
                      onChange={(e) =>
                        setAffordabilityInputs({
                          ...affordabilityInputs,
                          interestRate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-center rounded-lg bg-blue-50 p-8">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">You Can Afford</p>
                    <p className="mt-2 text-4xl font-bold text-blue-600">
                      ${affordability.toLocaleString()}
                    </p>
                    <p className="mt-4 text-sm text-gray-600">
                      Based on a 28% front-end ratio and 36% back-end ratio
                    </p>
                    <Button className="mt-6 w-full">Get Pre-Qualified</Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
