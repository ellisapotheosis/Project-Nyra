"use client";

import Link from "next/link";
import { CalendarDays, ArrowRight, Search } from "lucide-react";
import { useState } from "react";

import { BlurFade } from "@/components/ui/blur-fade";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const posts = [
  {
    id: "conventional-purchase-guide",
    title: "Conventional Mortgage Guide: 20% Down & Beyond",
    excerpt:
      "Everything you need to know about conventional home loans, including down payment options, credit requirements, and closing costs.",
    category: "Purchase",
    date: "2026-07-15",
    readTime: "8 min",
    tags: ["conventional", "purchase", "first-time buyer"],
  },
  {
    id: "fha-loan-guide",
    title: "FHA Loans Explained: 3.5% Down Payment Guide",
    excerpt:
      "FHA loans are ideal for first-time homebuyers. Learn about mortgage insurance, credit score requirements, and debt-to-income limits.",
    category: "Purchase",
    date: "2026-07-14",
    readTime: "10 min",
    tags: ["FHA", "first-time", "low down payment"],
  },
  {
    id: "va-loan-guide",
    title: "VA Loans: Zero Down Payment for Military & Veterans",
    excerpt:
      "Veterans and active-duty service members can access zero down payment VA loans. No PMI, no appraisal required.",
    category: "Purchase",
    date: "2026-07-13",
    readTime: "9 min",
    tags: ["VA", "veteran", "military", "zero down"],
  },
  {
    id: "cash-out-refi-guide",
    title: "Cash-Out Refinance: Turn Home Equity Into Cash",
    excerpt:
      "Unlock your home equity through a cash-out refinance. Compare rates, understand closing costs, and explore use cases.",
    category: "Refinance",
    date: "2026-07-12",
    readTime: "7 min",
    tags: ["refinance", "cash-out", "equity"],
  },
  {
    id: "heloc-guide",
    title: "HELOC vs HELOAN: Which Home Equity Option is Right?",
    excerpt:
      "Home equity lines of credit and loans offer flexible financing. Understand the differences, rates, and when to use each.",
    category: "Refinance",
    date: "2026-07-11",
    readTime: "8 min",
    tags: ["HELOC", "home equity", "credit line"],
  },
  {
    id: "rate-term-refi-guide",
    title: "Rate & Term Refinance: Lower Your Monthly Payment",
    excerpt:
      "Refinance your mortgage to reduce your interest rate. No cash-out means faster closing and lower costs.",
    category: "Refinance",
    date: "2026-07-10",
    readTime: "6 min",
    tags: ["refinance", "rate", "term"],
  },
  {
    id: "bank-statement-guide",
    title: "Bank Statement Loans for Self-Employed Borrowers",
    excerpt:
      "Self-employed? Freelancer? Bank statement loans verify income directly from your business bank accounts.",
    category: "Alternative",
    date: "2026-07-09",
    readTime: "9 min",
    tags: ["bank statement", "self-employed", "non-QM"],
  },
  {
    id: "dscr-guide",
    title: "DSCR Loans for Investment Properties & Rental Income",
    excerpt:
      "Qualify based on property income, not personal income. DSCR loans are perfect for real estate investors.",
    category: "Investment",
    date: "2026-07-08",
    readTime: "10 min",
    tags: ["DSCR", "investment", "rental", "commercial"],
  },
  {
    id: "hard-money-guide",
    title: "Hard Money Loans: Fast Funding for Fix & Flip",
    excerpt:
      "Need quick capital for a real estate deal? Hard money loans close in days, not months.",
    category: "Investment",
    date: "2026-07-07",
    readTime: "7 min",
    tags: ["hard money", "fix and flip", "investment"],
  },
  {
    id: "jumbo-guide",
    title: "Jumbo Mortgages for Luxury Homes Over $1M",
    excerpt:
      "Financing high-value properties requires different terms. Learn about jumbo loan rates, down payments, and qualifying.",
    category: "Jumbo",
    date: "2026-07-06",
    readTime: "8 min",
    tags: ["jumbo", "luxury", "high balance"],
  },
];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some((tag) =>
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <main className="relative min-h-screen bg-[#0a1628] text-[#f5f0e8] overflow-x-hidden pt-32">
      {/* Hero */}
      <section className="relative py-16 px-4 md:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <BlurFade delay={0.2}>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Mortgage Education Hub
          </h1>
        </BlurFade>
        <BlurFade delay={0.4}>
          <p className="text-lg text-[#8899aa] mb-12">
            Expert guides on loan programs, refinancing, investment properties,
            and everything you need to know about mortgages.
          </p>
        </BlurFade>

        {/* Search */}
        <BlurFade delay={0.6}>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8899aa]" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-[#0f1f3d]/40 border-[#c9a84c]/20 text-[#f5f0e8] placeholder:text-[#8899aa]"
            />
          </div>
        </BlurFade>
      </section>

      {/* Posts grid */}
      <section className="relative py-12 px-4 md:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="space-y-6">
          {filtered.map((post, i) => (
            <BlurFade key={post.id} delay={0.1 + i * 0.05}>
              <Link href={`/blog/${post.id}`}>
                <div className="group p-6 rounded-xl border border-[#c9a84c]/10 bg-[#0f1f3d]/40 hover:border-[#c9a84c]/30 hover:bg-[#0f1f3d]/60 transition-all duration-300 cursor-pointer">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className="text-xs border-[#c9a84c]/20 text-[#8899aa]"
                        >
                          {post.category}
                        </Badge>
                        <span className="text-xs text-[#8899aa]">
                          {post.readTime}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-[#f5f0e8] group-hover:text-[#c9a84c] transition-colors mb-2">
                        {post.title}
                      </h2>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#c9a84c] group-hover:translate-x-1 transition-transform flex-shrink-0 mt-1" />
                  </div>

                  {/* Excerpt */}
                  <p className="text-[#8899aa] mb-4">{post.excerpt}</p>

                  {/* Footer */}
                  <div className="flex items-center gap-2 text-xs text-[#8899aa] pt-4 border-t border-[#c9a84c]/10">
                    <CalendarDays className="w-4 h-4" />
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </Link>
            </BlurFade>
          ))}
        </div>

        {/* No results */}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#8899aa]">
              No articles found matching your search.
            </p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4 md:px-6 lg:px-8 max-w-4xl mx-auto text-center border-t border-[#c9a84c]/10">
        <BlurFade delay={0.2}>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            More programs coming soon
          </h2>
        </BlurFade>
        <BlurFade delay={0.4}>
          <p className="text-lg text-[#8899aa] mb-8">
            We're publishing guides for all 73+ loan programs. Subscribe to stay
            updated.
          </p>
        </BlurFade>
      </section>
    </main>
  );
}
