"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TypographyPage() {
  return (
    <main className="min-h-screen bg-[#0a1628] text-[#f5f0e8] pt-32 pb-24">
      {/* Back button */}
      <div className="fixed top-20 left-4 z-40">
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="border-[#c9a84c]/30 text-[#8899aa] hover:text-[#c9a84c]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 space-y-16">
        {/* Title */}
        <div className="text-center">
          <h1 className="font-wordmark text-6xl md:text-7xl font-bold mb-4">
            Typography System
          </h1>
          <p className="text-[#8899aa] text-lg">
            Premium fonts for RateHunter + Project Nyra
          </p>
        </div>

        {/* Orbitron - Wordmark */}
        <section className="border border-[#c9a84c]/20 rounded-xl p-8 bg-[#0f1f3d]/40">
          <div className="mb-6">
            <h2 className="font-wordmark text-sm uppercase tracking-widest text-[#c9a84c] mb-2">
              Font Family
            </h2>
            <h3 className="font-wordmark text-4xl md:text-5xl font-bold">
              Orbitron
            </h3>
            <p className="text-[#8899aa] mt-2">
              Safest wordmark base. Clean, futuristic, universally readable.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[#8899aa] uppercase mb-1">
                Regular (400)
              </p>
              <p className="font-wordmark text-2xl" style={{ fontWeight: 400 }}>
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
            <div>
              <p className="text-xs text-[#8899aa] uppercase mb-1">
                Bold (700)
              </p>
              <p className="font-wordmark text-2xl" style={{ fontWeight: 700 }}>
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
            <div>
              <p className="text-xs text-[#8899aa] uppercase mb-1">
                Black (900)
              </p>
              <p className="font-wordmark text-2xl" style={{ fontWeight: 900 }}>
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-[#c9a84c]/10">
            <code className="text-xs text-[#8899aa] bg-[#0a1628] px-3 py-2 rounded">
              font-family: &quot;Orbitron&quot;, sans-serif;
            </code>
          </div>
        </section>

        {/* Space Grotesk - Bold Concept */}
        <section className="border border-[#c9a84c]/20 rounded-xl p-8 bg-[#0f1f3d]/40">
          <div className="mb-6">
            <h2 className="font-wordmark text-sm uppercase tracking-widest text-[#c9a84c] mb-2">
              Font Family
            </h2>
            <h3 className="font-bold-concept text-4xl md:text-5xl font-bold">
              Space Grotesk
            </h3>
            <p className="text-[#8899aa] mt-2">
              Bold concept mark (Nebula Chronos fallback). High-contrast,
              striking headlines.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[#8899aa] uppercase mb-1">
                Regular (400)
              </p>
              <p
                className="font-bold-concept text-2xl"
                style={{ fontWeight: 400 }}
              >
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
            <div>
              <p className="text-xs text-[#8899aa] uppercase mb-1">
                Bold (700)
              </p>
              <p
                className="font-bold-concept text-2xl"
                style={{ fontWeight: 700 }}
              >
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-[#c9a84c]/10">
            <code className="text-xs text-[#8899aa] bg-[#0a1628] px-3 py-2 rounded">
              font-family: &quot;Space Grotesk&quot;, sans-serif;
            </code>
          </div>
        </section>

        {/* IBM Plex Mono - Tech */}
        <section className="border border-[#c9a84c]/20 rounded-xl p-8 bg-[#0f1f3d]/40">
          <div className="mb-6">
            <h2 className="font-wordmark text-sm uppercase tracking-widest text-[#c9a84c] mb-2">
              Font Family
            </h2>
            <h3 className="font-tech text-4xl md:text-5xl font-bold">
              IBM Plex Mono
            </h3>
            <p className="text-[#8899aa] mt-2">
              Tech alternative (Nexium fallback). Monospace precision, premium
              feel.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[#8899aa] uppercase mb-1">
                Regular (400)
              </p>
              <p className="font-tech text-2xl" style={{ fontWeight: 400 }}>
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
            <div>
              <p className="text-xs text-[#8899aa] uppercase mb-1">
                Bold (700)
              </p>
              <p className="font-tech text-2xl" style={{ fontWeight: 700 }}>
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-[#c9a84c]/10">
            <code className="text-xs text-[#8899aa] bg-[#0a1628] px-3 py-2 rounded">
              font-family: &quot;IBM Plex Mono&quot;, monospace;
            </code>
          </div>
        </section>

        {/* Cyber */}
        <section className="border border-[#c9a84c]/20 rounded-xl p-8 bg-[#0f1f3d]/40">
          <div className="mb-6">
            <h2 className="font-wordmark text-sm uppercase tracking-widest text-[#c9a84c] mb-2">
              Font Family
            </h2>
            <h3 className="font-cyber text-4xl md:text-5xl font-bold">
              Cyber Alt
            </h3>
            <p className="text-[#8899aa] mt-2">
              Aggressive cyber aesthetic (Cyberform fallback). Maximum impact,
              minimal elegance.
            </p>
          </div>
          <div>
            <p className="text-xs text-[#8899aa] uppercase mb-1">
              Display (900, uppercase)
            </p>
            <p className="font-cyber text-2xl md:text-4xl">
              MAXIMUM IMPACT HEADLINES
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-[#c9a84c]/10">
            <code className="text-xs text-[#8899aa] bg-[#0a1628] px-3 py-2 rounded">
              font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em;
            </code>
          </div>
        </section>

        {/* Rune */}
        <section className="border border-[#c9a84c]/20 rounded-xl p-8 bg-[#0f1f3d]/40">
          <div className="mb-6">
            <h2 className="font-wordmark text-sm uppercase tracking-widest text-[#c9a84c] mb-2">
              Font Family
            </h2>
            <h3 className="font-rune text-4xl md:text-5xl font-bold">
              Runefa (Symbol/Rune)
            </h3>
            <p className="text-[#8899aa] mt-2">
              Symbol/rune-only (Runefa). High spacing, ornamental use only.
            </p>
          </div>
          <div>
            <p className="text-xs text-[#8899aa] uppercase mb-1">
              Symbol Display
            </p>
            <p className="font-rune text-4xl md:text-6xl tracking-wider">
              ◆ ∞ ◇ ✦ ◈
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-[#c9a84c]/10">
            <code className="text-xs text-[#8899aa] bg-[#0a1628] px-3 py-2 rounded">
              letter-spacing: 0.1em; (ornamental only)
            </code>
          </div>
        </section>

        {/* Usage guide */}
        <section className="border border-[#c9a84c]/20 rounded-xl p-8 bg-[#0f1f3d]/40">
          <h2 className="font-wordmark text-2xl font-bold mb-6">Usage Guide</h2>
          <div className="space-y-4 text-[#8899aa]">
            <div>
              <h4 className="font-bold text-[#f5f0e8] mb-2">Wordmark (Orbitron)</h4>
              <p>
                Logo, primary navigation, main headings. Most versatile, widest
                platform support.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[#f5f0e8] mb-2">
                Bold Concept (Space Grotesk)
              </h4>
              <p>
                Section headers, call-to-action text, emphasis. High contrast
                for mobile readability.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[#f5f0e8] mb-2">Tech (IBM Plex Mono)</h4>
              <p>
                Technical specs, code samples, data displays. Monospace precision
                signals trustworthiness.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[#f5f0e8] mb-2">Cyber (Orbitron Alt)</h4>
              <p>
                Marketing splash, aggressive campaigns, special moments. Use
                sparingly for maximum impact.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[#f5f0e8] mb-2">Rune (Ornamental)</h4>
              <p>
                Dividers, bullet points, section breaks, Project Nyra portals only.
                Symbols and decorative elements.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
