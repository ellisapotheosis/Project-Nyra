"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  TrendingUp,
  Building2,
  DollarSign,
  Clock,
  Users,
  Search,
  X,
  ArrowRight,
} from "lucide-react";

import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Loan program taxonomy (73+ programs)
const loanPrograms = [
  // Residential Purchase (12)
  { id: 1, name: "Conventional Purchase", category: "Residential Purchase", icon: Home, description: "Standard 20-30% down payment loans" },
  { id: 2, name: "FHA Purchase", category: "Residential Purchase", icon: Home, description: "Low down payment (3.5%) government backed" },
  { id: 3, name: "VA Purchase", category: "Residential Purchase", icon: Home, description: "Zero down for military/veterans" },
  { id: 4, name: "USDA Purchase", category: "Residential Purchase", icon: Home, description: "Rural/suburban zero down loans" },
  { id: 5, name: "Jumbo Purchase", category: "Residential Purchase", icon: Home, description: "High balance (>$766K) conforming" },
  { id: 6, name: "FHA/VA/USDA Combo", category: "Residential Purchase", icon: Home, description: "Government programs combined" },
  { id: 7, name: "Bank Statement Qualifying", category: "Residential Purchase", icon: Home, description: "Self-employed income verification" },
  { id: 8, name: "Asset Depletion", category: "Residential Purchase", icon: Home, description: "Retired/investment income qualified" },
  { id: 9, name: "Portfolio Loans", category: "Residential Purchase", icon: Home, description: "Bank-held, flexible guidelines" },
  { id: 10, name: "Construction-to-Perm", category: "Residential Purchase", icon: Home, description: "New build with conversion" },
  { id: 11, name: "New Construction", category: "Residential Purchase", icon: Home, description: "Builder programs" },
  { id: 12, name: "Foreign National", category: "Residential Purchase", icon: Home, description: "International buyers (20-30% down)" },

  // Refinance (15)
  { id: 13, name: "Rate & Term Refi", category: "Refinance", icon: TrendingUp, description: "Lower rate or change term" },
  { id: 14, name: "Cash-Out Refinance", category: "Refinance", icon: DollarSign, description: "Extract equity for expenses" },
  { id: 15, name: "FHA Streamline", category: "Refinance", icon: TrendingUp, description: "FHA-to-FHA no appraisal" },
  { id: 16, name: "VA Streamline (IRRRL)", category: "Refinance", icon: TrendingUp, description: "VA-to-VA reduced documentation" },
  { id: 17, name: "ARM to Fixed", category: "Refinance", icon: TrendingUp, description: "Adjustable to fixed rate" },
  { id: 18, name: "No-Cash-Out Refinance", category: "Refinance", icon: TrendingUp, description: "Lower rate only" },
  { id: 19, name: "Investment Property Refi", category: "Refinance", icon: Building2, description: "Rental/investment cash-out" },
  { id: 20, name: "Reverse Mortgage", category: "Refinance", icon: TrendingUp, description: "Age 62+ tap home equity" },
  { id: 21, name: "HELOC (Home Equity Line)", category: "Refinance", icon: DollarSign, description: "Flexible credit line on equity" },
  { id: 22, name: "HELOAN (Home Equity Loan)", category: "Refinance", icon: DollarSign, description: "Fixed second mortgage" },
  { id: 23, name: "FHA 203(k) Rehab", category: "Refinance", icon: Building2, description: "Fixer-upper purchase + rehab" },
  { id: 24, name: "Irrevocable Trust Refi", category: "Refinance", icon: TrendingUp, description: "Trust-held property financing" },
  { id: 25, name: "Bridge Loan", category: "Refinance", icon: Clock, description: "Short-term for gap financing" },
  { id: 26, name: "Interest Rate Reduction", category: "Refinance", icon: TrendingUp, description: "FHA/VA rate reduction only" },
  { id: 27, name: "Debt Consolidation Refi", category: "Refinance", icon: DollarSign, description: "Roll CC/loans into mortgage" },

  // Alternative/Non-QM (16)
  { id: 28, name: "Non-QM (Bank Statement)", category: "Alternative/Non-QM", icon: DollarSign, description: "Self-employed 1-2 years docs" },
  { id: 29, name: "Non-QM (Asset-Based)", category: "Alternative/Non-QM", icon: DollarSign, description: "Investment/savings qualified" },
  { id: 30, name: "Non-QM (1099 Income)", category: "Alternative/Non-QM", icon: DollarSign, description: "Contractor/freelance 2yr history" },
  { id: 31, name: "Non-QM (Stated Income)", category: "Alternative/Non-QM", icon: DollarSign, description: "Income stated, not verified" },
  { id: 32, name: "Non-QM (Credit Impaired)", category: "Alternative/Non-QM", icon: DollarSign, description: "Lower credit score, higher rate" },
  { id: 33, name: "Non-QM (Gig Economy)", category: "Alternative/Non-QM", icon: DollarSign, description: "Uber/Lyft/DoorDash income" },
  { id: 34, name: "Crypto/Digital Asset", category: "Alternative/Non-QM", icon: DollarSign, description: "Cryptocurrency income qualified" },
  { id: 35, name: "Foreign Income", category: "Alternative/Non-QM", icon: DollarSign, description: "International/expat income" },
  { id: 36, name: "Recently Divorced", category: "Alternative/Non-QM", icon: Users, description: "Alimony/child support income" },
  { id: 37, name: "Bankruptcy (Chapter 7)", category: "Alternative/Non-QM", icon: DollarSign, description: "2 years post-discharge" },
  { id: 38, name: "Bankruptcy (Chapter 13)", category: "Alternative/Non-QM", icon: DollarSign, description: "While still in payment plan" },
  { id: 39, name: "Foreclosure Recovery", category: "Alternative/Non-QM", icon: DollarSign, description: "3 years post-foreclosure" },
  { id: 40, name: "Short Sale", category: "Alternative/Non-QM", icon: DollarSign, description: "3 years post-short sale" },
  { id: 41, name: "Late Payments/Charge-Off", category: "Alternative/Non-QM", icon: DollarSign, description: "Recent delinquencies OK" },
  { id: 42, name: "Medical/Hardship Collections", category: "Alternative/Non-QM", icon: DollarSign, description: "Medical debt forgiven" },
  { id: 43, name: "Limited Credit History", category: "Alternative/Non-QM", icon: DollarSign, description: "Thin credit file, high rate" },

  // Commercial/Investment (12)
  { id: 44, name: "Commercial Real Estate", category: "Commercial/Investment", icon: Building2, description: "Multi-family, office, retail" },
  { id: 45, name: "Investment Property", category: "Commercial/Investment", icon: Building2, description: "Rental homes, duplexes" },
  { id: 46, name: "Fix & Flip", category: "Commercial/Investment", icon: Building2, description: "Renovation financing 6-18mo" },
  { id: 47, name: "Business Purpose Loan", category: "Commercial/Investment", icon: Building2, description: "Owner-occupied commercial" },
  { id: 48, name: "Portfolio Loan (Investment)", category: "Commercial/Investment", icon: Building2, description: "Flexible investment terms" },
  { id: 49, name: "DSCR (Debt Service Coverage)", category: "Commercial/Investment", icon: Building2, description: "Rental income qualification" },
  { id: 50, name: "Stated Income Investment", category: "Commercial/Investment", icon: Building2, description: "Income stated, not verified" },
  { id: 51, name: "Bridge Loan (Commercial)", category: "Commercial/Investment", icon: Clock, description: "Gap funding for trades" },
  { id: 52, name: "Hard Money Loan", category: "Commercial/Investment", icon: DollarSign, description: "Asset-based, short-term" },
  { id: 53, name: "Mezz Financing", category: "Commercial/Investment", icon: Building2, description: "Subordinate financing" },
  { id: 54, name: "Line of Credit (LOC)", category: "Commercial/Investment", icon: DollarSign, description: "Flexible revolving credit" },
  { id: 55, name: "SBA Loans", category: "Commercial/Investment", icon: Building2, description: "Small Business Administration" },

  // Special Programs (10)
  { id: 56, name: "ARM (5/1, 7/1, 10/1)", category: "Special Programs", icon: TrendingUp, description: "Adjustable rate mortgages" },
  { id: 57, name: "Interest-Only ARM", category: "Special Programs", icon: TrendingUp, description: "Pay interest only first years" },
  { id: 58, name: "Balloon Loan", category: "Special Programs", icon: Home, description: "Large payment due at maturity" },
  { id: 59, name: "Personal Loan", category: "Special Programs", icon: DollarSign, description: "Unsecured credit" },
  { id: 60, name: "Hard Money (Residential)", category: "Special Programs", icon: DollarSign, description: "Quick funding, higher rate" },
  { id: 61, name: "Private Money/Portfolio", category: "Special Programs", icon: DollarSign, description: "Private investor backed" },
  { id: 62, name: "Energy-Efficient Mortgage", category: "Special Programs", icon: Home, description: "Solar/efficiency upgrades" },
  { id: 63, name: "Family Loan Formalization", category: "Special Programs", icon: Users, description: "Formalize informal loans" },
  { id: 64, name: "Lease-to-Own", category: "Special Programs", icon: Home, description: "Rent-to-own transition financing" },
  { id: 65, name: "Co-Signer/Co-Borrower", category: "Special Programs", icon: Users, description: "Secondary borrower qualification" },

  // Jumbo/High-Balance (6)
  { id: 66, name: "Jumbo >$1M", category: "Jumbo/High-Balance", icon: DollarSign, description: "Luxury home financing" },
  { id: 67, name: "Jumbo Portfolio", category: "Jumbo/High-Balance", icon: DollarSign, description: "Flexible jumbo terms" },
  { id: 68, name: "Jumbo ARM", category: "Jumbo/High-Balance", icon: TrendingUp, description: "Adjustable jumbo rate" },
  { id: 69, name: "Super Jumbo >$3M", category: "Jumbo/High-Balance", icon: DollarSign, description: "Ultra-premium financing" },
  { id: 70, name: "Investment Jumbo", category: "Jumbo/High-Balance", icon: Building2, description: "High-balance investment prop" },
  { id: 71, name: "Jumbo Refi", category: "Jumbo/High-Balance", icon: TrendingUp, description: "Refinance large balances" },

  // Niche/Specialty (2)
  { id: 72, name: "Construction Loan", category: "Niche/Specialty", icon: Building2, description: "New build progress-based" },
  { id: 73, name: "Manufactured/Mobile Home", category: "Niche/Specialty", icon: Home, description: "Mobile home financing" },
];

const categories = [
  "All",
  "Residential Purchase",
  "Refinance",
  "Alternative/Non-QM",
  "Commercial/Investment",
  "Special Programs",
  "Jumbo/High-Balance",
  "Niche/Specialty",
];

export default function ProgramsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = loanPrograms.filter((prog) => {
    const categoryMatch =
      selectedCategory === "All" || prog.category === selectedCategory;
    const searchMatch =
      prog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prog.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <main className="relative min-h-screen bg-[#0a1628] text-[#f5f0e8] overflow-x-hidden pt-32">
      {/* Hero section */}
      <section className="relative py-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <BlurFade delay={0.2}>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-center">
            73+ Loan Programs
          </h1>
        </BlurFade>
        <BlurFade delay={0.4}>
          <p className="text-lg text-[#8899aa] text-center mb-12 max-w-2xl mx-auto">
            Explore our comprehensive portfolio of mortgage solutions. From
            conventional to creative financing, we shop 500+ lenders to find
            your best rate.
          </p>
        </BlurFade>

        {/* Search & Filter */}
        <BlurFade delay={0.6}>
          <div className="space-y-6 mb-12">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8899aa]" />
              <Input
                type="text"
                placeholder="Search programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-[#0f1f3d]/40 border-[#c9a84c]/20 text-[#f5f0e8] placeholder:text-[#8899aa]"
              />
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    selectedCategory === cat
                      ? "bg-[#c9a84c] border-[#c9a84c] text-[#0a1628]"
                      : "border-[#c9a84c]/30 text-[#8899aa] hover:border-[#c9a84c]/50 hover:text-[#c9a84c]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Results count */}
            <div className="text-sm text-[#8899aa]">
              Showing {filtered.length} of {loanPrograms.length} programs
            </div>
          </div>
        </BlurFade>
      </section>

      {/* Programs grid */}
      <section className="relative py-12 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((prog, i) => (
            <BlurFade key={prog.id} delay={0.1 + i * 0.05}>
              <Link href={`/programs/${prog.id}`}>
                <div className="group relative h-full p-6 rounded-xl border border-[#c9a84c]/10 bg-[#0f1f3d]/40 hover:border-[#c9a84c]/30 hover:bg-[#0f1f3d]/60 transition-all duration-300 cursor-pointer">
                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-[#c9a84c]/5 pointer-events-none" />

                  {/* Icon */}
                  <div className="relative mb-4 flex items-center gap-3">
                    <div className="p-2 bg-[#c9a84c]/10 rounded-lg group-hover:bg-[#c9a84c]/20 transition-colors">
                      <prog.icon className="w-6 h-6 text-[#c9a84c]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#f5f0e8] group-hover:text-[#c9a84c] transition-colors">
                        {prog.name}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[#8899aa] mb-4">
                    {prog.description}
                  </p>

                  {/* Category badge + CTA */}
                  <div className="relative flex items-center justify-between pt-4 border-t border-[#c9a84c]/10">
                    <Badge
                      variant="outline"
                      className="text-xs border-[#c9a84c]/20 text-[#8899aa]"
                    >
                      {prog.category}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-[#c9a84c] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </BlurFade>
          ))}
        </div>

        {/* No results */}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#8899aa] mb-4">No programs found</p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              variant="outline"
              className="border-[#c9a84c]/30 text-[#c9a84c]"
            >
              <X className="w-4 h-4 mr-2" />
              Clear filters
            </Button>
          </div>
        )}
      </section>

      {/* CTA section */}
      <section className="relative py-24 px-4 md:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <BlurFade delay={0.2}>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Not sure which program fits?
          </h2>
        </BlurFade>
        <BlurFade delay={0.4}>
          <p className="text-lg text-[#8899aa] mb-8">
            Schedule a consultation. We'll review your situation and find the
            best loan program + rate from our network of 500+ lenders.
          </p>
        </BlurFade>
        <BlurFade delay={0.6}>
          <Link
            href="https://calendly.com/ellis_andersen?background_color=0f1f3d&text_color=f5f0e8&primary_color=c9a84c"
            target="_blank"
          >
            <Button className="bg-[#c9a84c] text-[#0a1628] hover:bg-[#f0d080] px-8 py-3 text-lg font-semibold">
              Schedule Consultation
            </Button>
          </Link>
        </BlurFade>
      </section>
    </main>
  );
}
