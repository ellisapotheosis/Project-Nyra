"use client";

import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";

export default function ConventionalGuidePage() {
  return (
    <main className="relative min-h-screen bg-[#0a1628] text-[#f5f0e8] overflow-x-hidden pt-20">
      {/* Back button */}
      <div className="fixed top-20 left-4 z-40">
        <Link href="/blog">
          <Button
            variant="outline"
            size="sm"
            className="border-[#c9a84c]/30 text-[#8899aa] hover:text-[#c9a84c]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-20">
        <BlurFade delay={0.2}>
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Conventional Mortgage Guide: 20% Down & Beyond
            </h1>
            <div className="flex items-center gap-4 text-[#8899aa] text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                July 15, 2026
              </div>
              <span>8 min read</span>
            </div>
          </div>
        </BlurFade>

        <BlurFade delay={0.4}>
          <div className="prose prose-invert max-w-none space-y-6 text-[#f5f0e8]">
            <p className="text-lg text-[#8899aa] leading-relaxed">
              Conventional mortgages are the most common type of home loan in
              America. They're backed by private lenders, not government
              agencies, and offer flexible terms that appeal to borrowers with
              good credit and stable income.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-4">
              What is a Conventional Mortgage?
            </h2>
            <p>
              A conventional mortgage is a loan to purchase a home that is not
              backed by the federal government. Instead, it's backed by private
              lenders like banks, credit unions, and mortgage companies. This
              means lenders set their own guidelines within general industry
              standards.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-4">
              Down Payment Requirements
            </h2>
            <p>
              Conventional loans typically require a down payment of 20% to get
              the best rates and avoid Private Mortgage Insurance (PMI). However,
              you can qualify with as little as 3-5% down if you're willing to
              pay PMI until you reach 20% equity.
            </p>
            <ul className="space-y-2 ml-6">
              <li>
                <strong>20% down:</strong> No PMI, best rates (~6.5-7%)
              </li>
              <li>
                <strong>10-19% down:</strong> PMI required, rates 7-7.5%
              </li>
              <li>
                <strong>5-9% down:</strong> PMI required, rates 7.5-8%
              </li>
              <li>
                <strong>3-5% down:</strong> PMI required, rates 8-8.5%
              </li>
            </ul>

            <h2 className="text-3xl font-bold mt-12 mb-4">
              Credit Score Requirements
            </h2>
            <p>
              Conventional loans require stronger credit than FHA or VA loans.
              Most lenders want a minimum credit score of 620, but competitive
              rates require 740+.
            </p>
            <ul className="space-y-2 ml-6">
              <li>
                <strong>740+:</strong> Best rates, flexible terms
              </li>
              <li>
                <strong>680-740:</strong> Good rates, minor restrictions
              </li>
              <li>
                <strong>620-680:</strong> Higher rates, stricter guidelines
              </li>
            </ul>

            <h2 className="text-3xl font-bold mt-12 mb-4">
              Debt-to-Income Ratio
            </h2>
            <p>
              Lenders typically want your debt-to-income (DTI) ratio below 43%.
              This means your total monthly debt payments divided by your gross
              monthly income should be less than 43%.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-4">
              Conventional vs. FHA vs. VA
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#c9a84c]/20">
                    <th className="text-left py-2 px-2">Feature</th>
                    <th className="text-left py-2 px-2">Conventional</th>
                    <th className="text-left py-2 px-2">FHA</th>
                    <th className="text-left py-2 px-2">VA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#c9a84c]/10">
                    <td className="py-2 px-2">Min Down</td>
                    <td className="py-2 px-2">3-20%</td>
                    <td className="py-2 px-2">3.5%</td>
                    <td className="py-2 px-2">0%</td>
                  </tr>
                  <tr className="border-b border-[#c9a84c]/10">
                    <td className="py-2 px-2">Min Credit</td>
                    <td className="py-2 px-2">620+</td>
                    <td className="py-2 px-2">580+</td>
                    <td className="py-2 px-2">None stated</td>
                  </tr>
                  <tr className="border-b border-[#c9a84c]/10">
                    <td className="py-2 px-2">PMI/MIP</td>
                    <td className="py-2 px-2">Yes (if down payment under 20%)</td>
                    <td className="py-2 px-2">Always</td>
                    <td className="py-2 px-2">No</td>
                  </tr>
                  <tr className="border-b border-[#c9a84c]/10">
                    <td className="py-2 px-2">Max DTI</td>
                    <td className="py-2 px-2">43-50%</td>
                    <td className="py-2 px-2">43-55%</td>
                    <td className="py-2 px-2">41-60%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-3xl font-bold mt-12 mb-4">
              Closing Costs & Fees
            </h2>
            <p>
              Expect to pay 2-5% of the loan amount in closing costs. A $300K
              home means $6K-$15K in costs, including origination fees, appraisal,
              title insurance, and attorney fees.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-4">
              When to Choose Conventional
            </h2>
            <ul className="space-y-2 ml-6">
              <li>You have good to excellent credit (740+)</li>
              <li>You can put down 20%+ to avoid PMI</li>
              <li>Your debt-to-income is below 43%</li>
              <li>You want the lowest rates available</li>
              <li>You're buying a standard residential property</li>
            </ul>

            <h2 className="text-3xl font-bold mt-12 mb-4">Ready to Get Started?</h2>
            <p>
              If a conventional mortgage makes sense for you, let's find the best
              rate from our network of 500+ lenders. Schedule a consultation to
              discuss your options.
            </p>
          </div>
        </BlurFade>

        {/* CTA */}
        <BlurFade delay={0.6}>
          <div className="mt-16 pt-8 border-t border-[#c9a84c]/10">
            <div className="bg-[#0f1f3d]/40 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Get Your Conventional Mortgage Rate
              </h3>
              <p className="text-[#8899aa] mb-6">
                We shop 500+ lenders to find your best conventional mortgage rate.
              </p>
              <Link
                href="https://calendly.com/ellis_andersen?background_color=0f1f3d&text_color=f5f0e8&primary_color=c9a84c"
                target="_blank"
              >
                <Button className="bg-[#c9a84c] text-[#0a1628] hover:bg-[#f0d080] px-8 py-3 text-lg font-semibold">
                  Schedule Consultation
                </Button>
              </Link>
            </div>
          </div>
        </BlurFade>
      </article>
    </main>
  );
}
