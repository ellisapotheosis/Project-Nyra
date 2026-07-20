"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Mail,
  MessageSquare,
  Phone,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Upload,
  ChevronRight,
  DollarSign,
  Clock,
  Users,
} from "lucide-react";

import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { Marquee } from "@/components/ui/marquee";
import { MovingBorder } from "@/components/ui/moving-border";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { HolographicShowcase } from "@/components/HolographicShowcase";

// ============================================================================
// CONTENT DATA
// ============================================================================

const contact = {
  name: "Ellis Andersen",
  roles: ["Branch Manager", "Mortgage Broker", "Real Estate Agent"],
  company: "West Capital Lending",
  phone: "+1 (949) 378-3133",
  phoneHref: "tel:+19493783133",
  smsHref: "sms:+19493783133",
  email: "eandersen@westcapitallending.com",
  emailHref: "mailto:eandersen@westcapitallending.com",
  fax: "+1 (949) 892-1736",
  address: "24 Executive Park, Suite 250, Irvine, CA 92614",
  calendly:
    "https://calendly.com/ellis_andersen?background_color=0f1f3d&text_color=f5f0e8&primary_color=c9a84c",
};

// ============================================================================
// CUSTOM EFFECT COMPONENTS (since shadcn URLs failed)
// ============================================================================

/** Aurora Background with animated colored blobs */
function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-60">
      {/* Purple blob */}
      <div
        className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 20% 50%, rgba(102, 0, 255, 0.4) 0%, transparent 50%)",
          animation: "aurora-shift 8s ease-in-out infinite",
        }}
      />
      {/* Cyan blob */}
      <div
        className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 80% 30%, rgba(1, 255, 255, 0.3) 0%, transparent 50%)",
          animation: "aurora-shift 10s ease-in-out infinite reverse",
        }}
      />
      {/* Gold/amber blob */}
      <div
        className="absolute top-1/4 left-1/3 w-2/3 h-2/3 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(201, 168, 76, 0.25) 0%, transparent 60%)",
          animation: "aurora-pulse 6s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes aurora-shift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }
        @keyframes aurora-pulse {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

/** Encrypted matrix-style text reveal */
function EncryptedText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState("");
  const chars = "Ω∆≈≠∑∏√∫©®™";

  useEffect(() => {
    let index = 0;
    let revealed = "";

    const interval = setInterval(() => {
      if (index < text.length) {
        let current = "";
        for (let i = 0; i < text.length; i++) {
          if (i < index) {
            current += text[i];
          } else {
            current +=
              chars[Math.floor(Math.random() * chars.length)];
          }
        }
        setDisplayText(current);
        index++;
      } else {
        setDisplayText(text);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="font-mono font-bold tracking-wider">
      {displayText}
    </span>
  );
}

/** Tracing beam that follows scroll */
function TracingBeam() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    };

    window.addEventListener("scroll", handleScroll);
    setHeight(container.offsetHeight);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="fixed left-8 top-0 h-full w-1 pointer-events-none">
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ filter: "drop-shadow(0 0 8px rgba(201, 168, 76, 0.6))" }}
      >
        <line
          x1="0.5"
          y1="0"
          x2="0.5"
          y2={`${height * scrollProgress}px`}
          stroke="rgba(201, 168, 76, 0.8)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

/** FlickeringGrid with tiny cells */
function FlickeringGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cellSize = 5;
    const cols = Math.ceil(canvas.width / cellSize);
    const rows = Math.ceil(canvas.height / cellSize);
    const grid: number[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => Math.random() * 0.8)
    );

    let frameCount = 0;

    function draw() {
      ctx.fillStyle = "rgba(15, 31, 61, 1)"; // Navy bg
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      frameCount++;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (Math.random() > 0.95) {
            grid[y][x] = Math.random() * 0.8;
          } else {
            grid[y][x] *= 0.95;
          }

          const alpha = grid[y][x];
          if (alpha > 0.05) {
            ctx.fillStyle = `rgba(201, 168, 76, ${alpha * 0.6})`;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
          }
        }
      }

      requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

/** LightRays — overlapping gold streaks for premium depth */
function LightRays() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-40">
      {/* Diagonal ray 1 — top-left to center */}
      <div
        className="absolute -inset-full"
        style={{
          background:
            "linear-gradient(135deg, rgba(201, 168, 76, 0.3) 0%, transparent 30%, transparent 70%, rgba(201, 168, 76, 0.15) 100%)",
          transform: "rotate(-45deg)",
          animation: "light-ray-1 8s ease-in-out infinite",
        }}
      />
      {/* Diagonal ray 2 — top-right to center */}
      <div
        className="absolute -inset-full"
        style={{
          background:
            "linear-gradient(45deg, transparent 20%, rgba(201, 168, 76, 0.25) 40%, transparent 60%)",
          transform: "rotate(45deg)",
          animation: "light-ray-2 10s ease-in-out infinite reverse",
        }}
      />
      {/* Vertical ray — center glow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-0 w-96 h-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(201, 168, 76, 0.2) 0%, transparent 40%, transparent 60%, rgba(201, 168, 76, 0.1) 100%)",
          filter: "blur(40px)",
          animation: "light-ray-pulse 6s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes light-ray-1 {
          0%, 100% { transform: translateX(-10%) rotateZ(-45deg); }
          50% { transform: translateX(10%) rotateZ(-45deg); }
        }
        @keyframes light-ray-2 {
          0%, 100% { transform: translateX(10%) rotateZ(45deg); }
          50% { transform: translateX(-10%) rotateZ(45deg); }
        }
        @keyframes light-ray-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

/** FloatingDock — fixed action buttons (View Rates, Pre-Qualified, Schedule) */
function FloatingDock() {
  const actions = [
    {
      label: "View Rates",
      icon: TrendingUp,
      href: "#",
      description: "Compare loan programs",
    },
    {
      label: "Get Pre-Qualified",
      icon: CheckCircle2,
      href: "#quote",
      description: "Start your application",
    },
    {
      label: "Schedule Consultation",
      icon: CalendarDays,
      href: contact.calendly,
      description: "Book with Ellis",
    },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-3">
      {actions.map((action, i) => (
        <Link
          key={i}
          href={action.href}
          target={action.href.startsWith("http") ? "_blank" : undefined}
          rel={action.href.startsWith("http") ? "noopener noreferrer" : undefined}
          className="group"
          title={action.description}
        >
          <div className="relative">
            {/* Animated glow background */}
            <div className="absolute inset-0 bg-[#c9a84c]/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Button */}
            <button className="relative flex items-center justify-center w-12 h-12 rounded-full border border-[#c9a84c]/40 bg-[#c9a84c]/10 hover:bg-[#c9a84c]/20 text-[#c9a84c] hover:text-[#f0d080] transition-all duration-300 backdrop-blur-sm">
              <action.icon className="w-5 h-5" />
            </button>
            {/* Tooltip label */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#0a1628]/90 border border-[#c9a84c]/30 rounded text-xs whitespace-nowrap text-[#f5f0e8] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300">
              {action.label}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

const actionLinks = [
  {
    label: "Schedule Time With Me",
    href: contact.calendly,
    icon: CalendarDays,
    description: "Calendly consult booking",
  },
  {
    label: "Get Your Quote",
    href: "#quote",
    icon: ArrowRight,
    description: "Pre-approval and application",
  },
  {
    label: "Fixed Rate HELOC",
    href: "#",
    icon: Building2,
    description: "Home equity line of credit",
  },
  {
    label: "Document Uploads",
    href: "#",
    icon: Upload,
    description: "Secure borrower delivery",
  },
];

const stats = [
  { label: "Lenders Shopped", value: 500, suffix: "+" },
  { label: "Average Savings", value: 2400, prefix: "$", suffix: "/year" },
  { label: "Days to Close", value: 21, suffix: " avg" },
];

// Placeholder icon for loan type
const HomeIcon = Building2;

const loanTypes = [
  { icon: HomeIcon, label: "Purchase", description: "Conventional, FHA, VA, Jumbo" },
  { icon: TrendingUp, label: "Refinance", description: "Rate-term, cash-out, HELOC" },
  { icon: Building2, label: "Residential", description: "Single family, multi-unit" },
  { icon: Shield, label: "Commercial", description: "Investment & business lending" },
  { icon: DollarSign, label: "Construction", description: "New builds & renovations" },
  { icon: Clock, label: "Fast Close", description: "15-21 day standard" },
];

const testimonials = [
  {
    quote: "Ellis got us a rate 0.75% lower than we qualified for anywhere else.",
    author: "Sarah M.",
    role: "First-time homebuyer",
    rating: 5,
  },
  {
    quote: "The process was so smooth. Ellis and his team handled everything.",
    author: "David K.",
    role: "Refinance client",
    rating: 5,
  },
  {
    quote: "Best broker we've worked with in 20 years. Highly recommend.",
    author: "Jennifer L.",
    role: "Investment property",
    rating: 5,
  },
  {
    quote: "They found a loan program nobody else knew about. Saved us $8k.",
    author: "Michael R.",
    role: "Cash-out refi",
    rating: 5,
  },
];

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#0a1628] text-[#f5f0e8] overflow-x-hidden">
      {/* Global effects layer */}
      <ScrollProgress className="top-0 h-1 bg-[#c9a84c]" />
      <FlickeringGrid />
      <TracingBeam />

      {/* Content container */}
      <div className="relative z-10">
        {/* ─────────────────────────────────────────────────────────── */}
        {/* NAVBAR */}
        {/* ─────────────────────────────────────────────────────────── */}
        <nav className="sticky top-0 z-40 border-b border-[rgba(201,168,76,0.2)] bg-[#0a1628]/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <Image
                src="/ratehunter-navbar-logo.png"
                alt="RateHunter"
                width={160}
                height={40}
                priority
                className="h-8 w-auto object-contain"
              />
            </div>
            <div className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-wider text-[#8899aa] md:flex">
              <Link href="/programs" className="hover:text-[#c9a84c] transition-colors">
                Programs
              </Link>
              <Link href="/blog" className="hover:text-[#c9a84c] transition-colors">
                Blog
              </Link>
              <a href="#quote" className="hover:text-[#c9a84c] transition-colors">
                Quote
              </a>
              <a href="#services" className="hover:text-[#c9a84c] transition-colors">
                Services
              </a>
              <a href="#contact" className="hover:text-[#c9a84c] transition-colors">
                Contact
              </a>
            </div>
            <Link
              href={contact.calendly}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-8 border-[#c9a84c]/30 bg-[#c9a84c]/5 px-4 text-[#c9a84c] hover:bg-[#c9a84c]/10 hover:text-[#f0d080]"
              )}
            >
              Consult
            </Link>
          </div>
        </nav>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* HERO */}
        {/* ─────────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          <AuroraBackground />
          <LightRays />

          <div className="relative z-20 mx-auto max-w-4xl px-4 text-center md:px-6 lg:px-8">
            <BlurFade delay={0.2}>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 font-[family-name:var(--font-display)]">
                <EncryptedText text="HUNT THE BEST RATE" />
              </h1>
            </BlurFade>

            <BlurFade delay={0.4}>
              <div className="text-lg md:text-2xl text-[#c9a84c] mb-8 font-mono tracking-wide">
                <TypingAnimation
                  words={["Purchase", "Refinance", "HELOC", "Jumbo"]}
                  typingSpeed={60}
                  pauseDuration={1500}
                />
              </div>
            </BlurFade>

            <BlurFade delay={0.6}>
              <AnimatedGradientText className="mb-12">
                500+ lenders shopped. One trusted broker.
              </AnimatedGradientText>
            </BlurFade>

            <BlurFade delay={0.8}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href={contact.calendly}>
                  <ShimmerButton className="gap-2">
                    Get Started <ArrowRight className="w-4 h-4" />
                  </ShimmerButton>
                </Link>
                <Button
                  variant="outline"
                  className="border-[#c9a84c]/30 hover:bg-[#c9a84c]/5"
                  onClick={() =>
                    document
                      .getElementById("quote")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Learn More
                </Button>
              </div>
            </BlurFade>

            {/* Quick action badges */}
            <BlurFade delay={1}>
              <div className="flex flex-wrap gap-2 justify-center">
                {actionLinks.slice(0, 3).map((link) => (
                  <Badge
                    key={link.label}
                    variant="outline"
                    className="border-[#c9a84c]/20 text-[#c9a84c]"
                  >
                    <link.icon className="w-3 h-3 mr-1" />
                    {link.label}
                  </Badge>
                ))}
              </div>
            </BlurFade>
          </div>

          {/* Scroll indicator */}
          <BlurFade delay={1.2} className="absolute bottom-24 left-1/2 -translate-x-1/2">
            <div className="text-center text-xs text-[#8899aa]">
              <div>Scroll to explore</div>
              <div className="text-[#c9a84c] mt-2">↓</div>
            </div>
          </BlurFade>

          {/* Floating Dock */}
          <FloatingDock />
        </section>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* STATS STRIP */}
        {/* ─────────────────────────────────────────────────────────── */}
        <section className="relative py-20 border-t border-b border-[#c9a84c]/10">
          <div className="mx-auto max-w-6xl px-4 grid md:grid-cols-3 gap-8 md:px-6 lg:px-8">
            {stats.map((stat, i) => (
              <BlurFade key={i} delay={0.2 + i * 0.2}>
                <MovingBorder
                  duration={3000}
                  borderRadius="0.75rem"
                  className="rounded-lg bg-[#0f1f3d]/40 p-6"
                >
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-[#c9a84c] mb-2 font-mono">
                      {stat.prefix}
                      <NumberTicker value={stat.value} />
                      {stat.suffix}
                    </div>
                    <div className="text-sm text-[#8899aa]">{stat.label}</div>
                  </div>
                </MovingBorder>
              </BlurFade>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* SERVICES (id="services") */}
        {/* ─────────────────────────────────────────────────────────── */}
        <section id="services" className="relative py-24">
          <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
            <BlurFade delay={0.2}>
              <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
                Mortgage Solutions
              </h2>
            </BlurFade>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loanTypes.map((loan, i) => (
                <BlurFade key={i} delay={0.2 + i * 0.1}>
                  <Card className="bg-[#0f1f3d]/40 border-[#c9a84c]/10 hover:border-[#c9a84c]/30 transition-all hover:shadow-lg hover:shadow-[#c9a84c]/10">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#c9a84c]/10 rounded-lg">
                          <loan.icon className="w-5 h-5 text-[#c9a84c]" />
                        </div>
                        <CardTitle className="text-lg">{loan.label}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-[#8899aa]">{loan.description}</p>
                    </CardContent>
                  </Card>
                </BlurFade>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* HOW IT WORKS */}
        {/* ─────────────────────────────────────────────────────────── */}
        <section className="relative py-24 border-t border-[#c9a84c]/10">
          <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
            <BlurFade delay={0.2}>
              <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
                The RateHunter Process
              </h2>
            </BlurFade>

            <div className="grid md:grid-cols-5 gap-2 md:gap-4">
              {[
                { step: 1, label: "Info", description: "Tell us your scenario" },
                { step: 2, label: "Hunt", description: "We shop 500+ lenders" },
                { step: 3, label: "Compare", description: "Real rate quotes" },
                { step: 4, label: "Lock", description: "Best rate & terms" },
                {
                  step: 5,
                  label: "Close",
                  description: "Fast, seamless closing",
                },
              ].map((item, i) => (
                <BlurFade key={i} delay={0.2 + i * 0.1}>
                  <div className="text-center">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-[#c9a84c] text-[#0a1628] flex items-center justify-center font-bold mx-auto mb-3">
                        {item.step}
                      </div>
                      {i < 4 && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 w-full md:w-12 h-0.5 bg-[#c9a84c]/20" />
                      )}
                    </div>
                    <h3 className="font-semibold mb-1">{item.label}</h3>
                    <p className="text-xs text-[#8899aa]">
                      {item.description}
                    </p>
                  </div>
                </BlurFade>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* TESTIMONIALS */}
        {/* ─────────────────────────────────────────────────────────── */}
        <section className="relative py-24 border-t border-[#c9a84c]/10">
          <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
            <BlurFade delay={0.2}>
              <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
                Client Reviews
              </h2>
            </BlurFade>

            <Marquee className="[--duration:20s]">
              {testimonials.map((t, i) => (
                <Card
                  key={i}
                  className="mx-4 w-[400px] bg-[#0f1f3d]/40 border-[#c9a84c]/10"
                >
                  <CardHeader>
                    <div className="flex gap-1 mb-2">
                      {Array(t.rating)
                        .fill(0)
                        .map((_, j) => (
                          <Star
                            key={j}
                            className="w-4 h-4 fill-[#c9a84c] text-[#c9a84c]"
                          />
                        ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">"{t.quote}"</p>
                    <div className="text-xs">
                      <div className="font-semibold text-[#f5f0e8]">
                        {t.author}
                      </div>
                      <div className="text-[#8899aa]">{t.role}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </Marquee>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* LEAD FORM (id="quote") */}
        {/* ─────────────────────────────────────────────────────────── */}
        <section id="quote" className="relative py-24 border-t border-[#c9a84c]/10">
          <div className="mx-auto max-w-2xl px-4 md:px-6 lg:px-8">
            <BlurFade delay={0.2}>
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Get Your Rate
                </h2>
                <p className="text-[#8899aa]">
                  Free pre-qualification in 2 minutes
                </p>
              </div>
            </BlurFade>

            <BlurFade delay={0.4}>
              <MovingBorder
                duration={3000}
                borderRadius="1rem"
                className="rounded-2xl bg-[#0f1f3d]/60 p-8"
              >
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First name"
                      className="px-4 py-3 rounded-lg bg-[#0a1628]/80 border border-[#c9a84c]/10 text-[#f5f0e8] placeholder-[#8899aa] focus:outline-none focus:border-[#c9a84c]/30 focus:ring-1 focus:ring-[#c9a84c]/20"
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      className="px-4 py-3 rounded-lg bg-[#0a1628]/80 border border-[#c9a84c]/10 text-[#f5f0e8] placeholder-[#8899aa] focus:outline-none focus:border-[#c9a84c]/30 focus:ring-1 focus:ring-[#c9a84c]/20"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      placeholder="Email address"
                      className="w-full px-4 py-3 rounded-lg bg-[#0a1628]/80 border border-[#c9a84c]/10 text-[#f5f0e8] placeholder-[#8899aa] focus:outline-none focus:border-[#c9a84c]/30 focus:ring-1 focus:ring-[#c9a84c]/20"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="tel"
                      placeholder="Phone number"
                      className="px-4 py-3 rounded-lg bg-[#0a1628]/80 border border-[#c9a84c]/10 text-[#f5f0e8] placeholder-[#8899aa] focus:outline-none focus:border-[#c9a84c]/30 focus:ring-1 focus:ring-[#c9a84c]/20"
                    />
                    <select className="px-4 py-3 rounded-lg bg-[#0a1628]/80 border border-[#c9a84c]/10 text-[#f5f0e8] focus:outline-none focus:border-[#c9a84c]/30 focus:ring-1 focus:ring-[#c9a84c]/20">
                      <option value="">Loan type</option>
                      <option value="purchase">Purchase</option>
                      <option value="refi">Refinance</option>
                      <option value="heloc">HELOC</option>
                      <option value="cash-out">Cash-out Refi</option>
                    </select>
                  </div>

                  <Button
                    className="w-full bg-[#c9a84c] hover:bg-[#f0d080] text-[#0a1628] font-bold h-12 rounded-lg"
                    asChild
                  >
                    <ShimmerButton>Get My Rate</ShimmerButton>
                  </Button>

                  <p className="text-xs text-[#8899aa] text-center">
                    We'll call within 1 hour during business hours
                  </p>
                </form>
              </MovingBorder>
            </BlurFade>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* HOLOGRAPHIC SHOWCASE */}
        {/* ─────────────────────────────────────────────────────────── */}
        <HolographicShowcase />

        {/* ─────────────────────────────────────────────────────────── */}
        {/* CONTACT & FOOTER (id="contact") */}
        {/* ─────────────────────────────────────────────────────────── */}
        <footer
          id="contact"
          className="relative py-24 border-t border-[#c9a84c]/10 bg-[#0f1f3d]/40"
        >
          <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Brand */}
              <BlurFade delay={0.2}>
                <div>
                  <Image
                    src="/ratehunter-footer-logo.png"
                    alt="RateHunter"
                    width={140}
                    height={40}
                    className="h-6 w-auto mb-4"
                  />
                  <p className="text-xs text-[#8899aa]">
                    Connecting borrowers with the best mortgage rates since 2018.
                  </p>
                </div>
              </BlurFade>

              {/* Quick Links */}
              <BlurFade delay={0.3}>
                <div>
                  <h3 className="font-semibold mb-4">Quick Links</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href={contact.calendly}
                        className="text-[#8899aa] hover:text-[#c9a84c]"
                      >
                        Schedule Consult
                      </a>
                    </li>
                    <li>
                      <a href="#quote" className="text-[#8899aa] hover:text-[#c9a84c]">
                        Get Quote
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-[#8899aa] hover:text-[#c9a84c]">
                        Loan Programs
                      </a>
                    </li>
                  </ul>
                </div>
              </BlurFade>

              {/* Contact Info */}
              <BlurFade delay={0.4}>
                <div>
                  <h3 className="font-semibold mb-4">Contact</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href={contact.phoneHref}
                        className="text-[#8899aa] hover:text-[#c9a84c] flex items-center gap-2"
                      >
                        <Phone className="w-3 h-3" />
                        {contact.phone}
                      </a>
                    </li>
                    <li>
                      <a
                        href={contact.emailHref}
                        className="text-[#8899aa] hover:text-[#c9a84c] flex items-center gap-2"
                      >
                        <Mail className="w-3 h-3" />
                        {contact.email}
                      </a>
                    </li>
                  </ul>
                </div>
              </BlurFade>

              {/* Social */}
              <BlurFade delay={0.5}>
                <div>
                  <h3 className="font-semibold mb-4">Social</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href="https://linkedin.com/in/ellisandersen"
                        className="text-[#8899aa] hover:text-[#c9a84c]"
                      >
                        LinkedIn
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://instagram.com/ellisapotheosis"
                        className="text-[#8899aa] hover:text-[#c9a84c]"
                      >
                        Instagram
                      </a>
                    </li>
                  </ul>
                </div>
              </BlurFade>
            </div>

            <div className="border-t border-[#c9a84c]/10 pt-8 text-center text-xs text-[#8899aa]">
              <p>© 2024 RateHunter. All rights reserved.</p>
              <p className="mt-2">
                NMLS #{1912260} | West Capital Lending NMLS #{1566096}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
