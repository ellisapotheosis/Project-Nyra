"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Landmark,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Upload,
} from "lucide-react";

import { BorrowerChatWidget } from "@/components/BorrowerChatWidget";
import { LeadCaptureWizard } from "@/components/LeadCaptureWizard";
import { AuroraBackground } from "@/components/AuroraBackground";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { Marquee } from "@/components/ui/marquee";
import { MovingBorder } from "@/components/ui/moving-border";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { CursorSpotlight } from "@/components/ui/cursor-spotlight";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RateHeartbeat } from "@/components/ui/rate-heartbeat";
import { InkReveal } from "@/components/ui/ink-reveal";
import { RateCard3D } from "@/components/ui/rate-card-3d";
import { PaymentDonut } from "@/components/ui/payment-donut";
import { RateLockWidget } from "@/components/RateLockWidget";
import { RateParticleCloud } from "@/components/RateParticleCloud";
import { MortgageNarrativeHero } from "@/components/MortgageNarrativeHero";
import { RateForecastWidget } from "@/components/ui/rate-forecast-widget";
import { useRates } from "@/hooks/useRates";

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
    "https://calendly.com/ellis_andersen?background_color=1a1a1a&text_color=ffffff&primary_color=636cff",
};

const actionLinks = [
  {
    label: "Schedule Time With Me",
    href: contact.calendly,
    icon: CalendarDays,
    description: "Calendly consult booking",
  },
  {
    label: "Mortgage Quote/Application Portal",
    href: "https://prod.lendingpad.com/west-capital-lending-inc-/pos#/?loid=eec1ff11-91aa-4f4e-930e-f179e54e34d5",
    icon: ArrowRight,
    description: "Pre-approval and application portal",
  },
  {
    label: "Fixed Rate HELOC Quote",
    href: "https://heloc.westcapitallending.com/account/heloc/register?referrer=c6b56b11-3f54-4719-83bc-964085a31e87",
    icon: Building2,
    description: "Standalone HELOC quote flow",
  },
  {
    label: "Encrypted Document Uploads",
    href: "https://documentguardian.com/filedrop/~OmuOfV",
    icon: Upload,
    description: "Secure borrower document delivery",
  },
  {
    label: "West Capital Lending",
    href: "https://www.westcapitallending.com/",
    icon: ExternalLink,
    description: "Company profile and brokerage information",
  },
  {
    label: "Save Contact Info",
    href: "https://app.wavecnct.com/ellis.andersen.myo8",
    icon: Phone,
    description: "Digital contact card",
  },
];

const socials = [
  { label: "Instagram", href: "https://instagram.com/ellisapotheosis" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ellisandersen/" },
  {
    label: "NMLS Licensee Verification",
    href: "https://www.nmlsconsumeraccess.org/EntityDetails.aspx/INDIVIDUAL/1912260",
  },
  {
    label: "Company NMLS Verification",
    href: "https://www.nmlsconsumeraccess.org/EntityDetails.aspx/COMPANY/1566096",
  },
];

const serviceLines = [
  {
    title: "Purchase Mortgage Strategy",
    body: "Conventional, FHA, VA, jumbo, and investor lending structured around payment comfort, timeline readiness, and the way you actually plan to use the property.",
  },
  {
    title: "Refinance & Equity",
    body: "Rate-and-term, cash-out, HELOC, reverse, and specialty options broken down in plain language with real break-even thinking.",
  },
  {
    title: "Residential & Commercial",
    body: "First homes, move-up purchases, commercial property, and harder scenarios where cookie-cutter retail lending tends to stall.",
  },
  {
    title: "Fast, Borrower-Friendly Execution",
    body: "Wholesale lender shopping, faster-than-average closes, secure document handling, and AI-assisted guidance when you need answers after hours.",
  },
];

const trustPoints = [
  "Hundreds of approved lenders and investors shopped on your behalf",
  "A+ BBB reputation and five-star reviews across platforms",
  "Borrower chat, quote intake, and document guidance available from one front door",
  "Licensed mortgage and real estate guidance coordinated around your scenario",
];

const marketPulse = [
  {
    label: "30Y fixed watch",
    value: "Volatile",
    detail: "Compare points and APR, not just note rate.",
  },
  {
    label: "MBS tone",
    value: "Choppy",
    detail: "Lock timing should match your closing risk.",
  },
  {
    label: "HELOC demand",
    value: "Elevated",
    detail: "Useful for equity access without replacing a low first lien.",
  },
  {
    label: "Purchase leverage",
    value: "Local",
    detail: "Seller credit strategy depends heavily on micro-market supply.",
  },
];

export default function Home() {
  const { rates, best } = useRates(true);
  return (
    <main className="relative min-h-screen pb-20 text-white selection:bg-primary/20">
      <MortgageNarrativeHero />
      <AuroraBackground />
      <ScrollProgress />
      <div className="relative z-[1] mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-24 pt-6 md:px-6 lg:px-8">
        <nav className="glass-panel sticky top-4 z-40 flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-black/60 px-6 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
              <Landmark className="size-4.5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-white uppercase">
              RateHunter
            </span>
          </div>
          <div className="hidden items-center gap-5 text-[11px] font-semibold uppercase tracking-wider text-white/50 md:flex">
            <a href="#quote" className="hover:text-white transition-colors">
              Quote
            </a>
            <a href="#services" className="hover:text-white transition-colors">
              Services
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
          <Link
            href={contact.calendly}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 border-indigo-500/20 bg-indigo-500/5 px-4 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
            )}
          >
            Consult
          </Link>
        </nav>

        <CursorSpotlight className="rounded-[2.25rem]">
          <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <MovingBorder
              containerClassName="rounded-[2.25rem]"
              rx="2.25rem"
              ry="2.25rem"
              duration={3800}
            >
              <div className="glass-panel overflow-hidden rounded-[calc(2.25rem-2px)] w-full">
                <div className="grid gap-8 px-6 py-7 2xl:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-8">
                  <div className="space-y-5">
                    <div className="overflow-hidden rounded-[1.6rem] border border-white/8 bg-black/20">
                      <Image
                        src="/carrd-assets/images/ellis-portrait.jpg"
                        alt="Ellis Andersen portrait"
                        width={840}
                        height={840}
                        className="aspect-square h-auto w-full object-cover"
                      />
                    </div>
                    <div className="subtle-panel rounded-[1.5rem] p-4">
                      <p className="eyebrow text-[11px] text-white/45">
                        Scan or Save
                      </p>
                      <Image
                        src="/carrd-assets/images/ellis-contact-card.jpg"
                        alt="Ellis Andersen contact card"
                        width={600}
                        height={600}
                        className="mt-3 h-auto w-full rounded-[1.1rem]"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                      {contact.roles.map((role) => (
                        <Badge
                          key={role}
                          variant="secondary"
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/72"
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <p className="eyebrow text-[11px] text-white/45">
                        {contact.company}
                      </p>
                      <h1 className="display-copy text-4xl leading-[1.04] tracking-[-0.04em] text-balance md:text-6xl">
                        <AnimatedGradientText>
                          Ellis Andersen
                        </AnimatedGradientText>
                      </h1>
                      <TypingAnimation
                        words={[
                          "Purchase",
                          "Refinance",
                          "HELOC",
                          "Jumbo",
                          "VA Loans",
                          "FHA",
                        ]}
                        className="text-base text-white/60 font-medium tracking-wide mt-1"
                      />
                      <p className="max-w-2xl text-lg leading-8 text-white/72">
                        Your trusted mortgage partner for residential,
                        commercial, refinance, HELOC, and real estate strategy.
                        I shop wholesale lender pricing, move quickly, and
                        tailor the loan structure around your actual financial
                        profile instead of forcing you into a generic retail
                        box.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <MagneticButton>
                        <Link href={contact.calendly} className="contents">
                          <ShimmerButton className="h-12 w-full rounded-full px-5 font-semibold text-sm">
                            <CalendarDays className="size-4" />
                            Schedule Time With Me
                          </ShimmerButton>
                        </Link>
                      </MagneticButton>
                      <a
                        href="#quote"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "lg" }),
                          "h-12 rounded-full border-white/12 bg-white/5 px-5 text-sm text-white hover:bg-white/10"
                        )}
                      >
                        <Sparkles className="size-4" />
                        Start Quote Intake
                      </a>
                      <Link
                        href={contact.phoneHref}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "lg" }),
                          "h-12 rounded-full bg-white/[0.04] px-5 text-sm text-white/82 hover:bg-white/[0.08]"
                        )}
                      >
                        <Phone className="size-4" />
                        Call Me
                      </Link>
                      <Link
                        href={contact.smsHref}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "lg" }),
                          "h-12 rounded-full bg-white/[0.04] px-5 text-sm text-white/82 hover:bg-white/[0.08]"
                        )}
                      >
                        <MessageSquare className="size-4" />
                        Text Me
                      </Link>
                    </div>

                    {/* ── quick-stats strip ── */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          value: 6.25,
                          dec: 2,
                          prefix: "",
                          suffix: "%",
                          label: "Best Rate Today",
                        },
                        {
                          value: 40,
                          dec: 0,
                          prefix: "",
                          suffix: "+",
                          label: "Lenders Shopped",
                        },
                        {
                          value: 0,
                          dec: 0,
                          prefix: "$",
                          suffix: "",
                          label: "Broker Markup",
                        },
                      ].map(({ value, dec, prefix, suffix, label }) => (
                        <div
                          key={label}
                          className="subtle-panel rounded-[1.25rem] py-3 text-center"
                        >
                          <p className="text-xl font-bold tabular-nums text-white">
                            <NumberTicker
                              value={value}
                              decimalPlaces={dec}
                              prefix={prefix}
                              suffix={suffix}
                            />
                          </p>
                          <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-white/45">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>

                    <InkReveal delay={0.5} className="mt-5">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider opacity-50">
                          Live Rate Feed
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.8871_0.1828_166.5465)] animate-pulse" />
                      </div>
                      <RateHeartbeat
                        currentRate={best?.rate ?? 6.625}
                        weeklyAverage={6.75}
                        width={400}
                        height={56}
                        className="w-full max-w-[400px]"
                      />
                    </InkReveal>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="subtle-panel rounded-[1.35rem] p-4">
                        <p className="eyebrow text-[10px] text-white/40">
                          Direct Contact
                        </p>
                        <div className="mt-3 grid gap-2 text-sm text-white/75">
                          <Link
                            href={contact.emailHref}
                            className="inline-flex items-center gap-2 hover:text-white"
                          >
                            <Mail className="size-4 text-[hsl(var(--primary))]" />
                            {contact.email}
                          </Link>
                          <p className="inline-flex items-center gap-2">
                            <Phone className="size-4 text-[hsl(var(--primary))]" />
                            {contact.phone}
                          </p>
                          <p className="inline-flex items-start gap-2">
                            <MapPin className="mt-0.5 size-4 shrink-0 text-[hsl(var(--primary))]" />
                            {contact.address}
                          </p>
                        </div>
                      </div>
                      <div className="subtle-panel rounded-[1.35rem] p-4">
                        <p className="eyebrow text-[10px] text-white/40">
                          Licensing
                        </p>
                        <div className="mt-3 grid gap-2 text-sm text-white/75">
                          <p>NMLS 1912260 | Company NMLS 1566096</p>
                          <p>DRE 02196940 | Company DRE 02022356</p>
                          <p>Fax: {contact.fax}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </MovingBorder>

            <div id="quote" className="space-y-5">
              <div className="glass-panel rounded-[2.1rem] p-5">
                <p className="eyebrow text-[11px] text-white/45">
                  Borrower Intake
                </p>
                <h2 className="mt-3 display-copy text-3xl tracking-[-0.04em]">
                  Start your quote without the usual friction.
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/68">
                  Share the basics for a scenario review. This is an intake
                  request for broker follow-up, not an automated approval or a
                  binding loan estimate.
                </p>
                <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs leading-6 text-white/58">
                  By submitting, you authorize contact about your mortgage
                  request by phone, SMS, and email. Consent is not required to
                  buy services. Reply STOP to texts to opt out. Your information
                  is used for mortgage review and referral attribution, then
                  routed through approved server-side intake boundaries.
                </p>
              </div>
              <LeadCaptureWizard />
            </div>
          </section>
        </CursorSpotlight>

        <BlurFade delay={0.08}>
          <section className="glass-panel overflow-hidden rounded-[2rem]">
            <div className="flex flex-col gap-5 border-b border-white/8 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="eyebrow text-[11px] text-white/45">
                  Market Pulse
                </p>
                <h2 className="mt-2 display-copy text-2xl tracking-[-0.04em]">
                  Rate context for better conversations, not promises.
                </h2>
              </div>
              <Link
                href={contact.calendly}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-full border-white/12 bg-white/5 text-white hover:bg-white/10"
                )}
              >
                <CalendarDays className="size-4" />
                Talk through timing
              </Link>
            </div>
            <div className="overflow-hidden border-b border-white/8 bg-black/20">
              <Marquee pauseOnHover speed={42}>
                {marketPulse.map((item) => (
                  <div
                    key={item.label}
                    className="inline-flex min-w-max items-center gap-3 px-5 py-3 text-sm"
                  >
                    <TrendingUp className="size-4 text-[hsl(var(--primary))]" />
                    <span className="font-semibold text-white/86">
                      {item.label}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/68">
                      {item.value}
                    </span>
                  </div>
                ))}
              </Marquee>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
              {marketPulse.map((item) => (
                <div
                  key={item.label}
                  className="subtle-panel rounded-[1.4rem] p-4"
                >
                  <p className="text-sm font-semibold text-white/86">
                    {item.label}
                  </p>
                  <p className="mt-2 text-xs leading-6 text-white/58">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </BlurFade>

        <BlurFade delay={0.1}>
          <section className="glass-panel overflow-hidden rounded-[2rem] p-6">
            <p className="eyebrow text-[11px] text-white/45 mb-2">
              Compare Rates
            </p>
            <h2 className="display-copy text-2xl tracking-[-0.04em] mb-4">
              Today's Lender Landscape
            </h2>
            <p className="text-sm text-white/60 mb-4">
              Click a bubble to select. Seafoam = best available rate.
            </p>
            <RateParticleCloud
              rates={rates}
              onSelect={(lender) => console.log("Selected:", lender.name)}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-6 min-h-[120px]">
              {rates.slice(0, 8).map((lender) => (
                <RateCard3D
                  key={lender.id}
                  lender={lender}
                  isBest={lender.id === (best?.id ?? "")}
                />
              ))}
            </div>
            <div className="mt-6">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-3">
                Payment Breakdown
              </p>
              <PaymentDonut
                principal={1240}
                interest={1380}
                taxes={320}
                insurance={130}
              />
            </div>
          </section>
        </BlurFade>

        <section className="mx-auto max-w-4xl px-4 py-8">
          <RateForecastWidget />
        </section>

        <BlurFade delay={0.12}>
          <section className="section-divider pt-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {trustPoints.map((point) => (
                <Card
                  key={point}
                  className="subtle-panel rounded-[1.7rem] border-white/8 bg-transparent py-0 text-white shadow-none"
                >
                  <CardContent className="flex items-start gap-3 p-5">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[hsl(var(--primary))]" />
                    <p className="text-sm leading-7 text-white/72">{point}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </BlurFade>

        <BlurFade delay={0.1}>
          <section
            id="services"
            className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]"
          >
            <div className="glass-panel rounded-[2.1rem] p-6 lg:p-8">
              <p className="eyebrow text-[11px] text-white/45">
                Advisory Approach
              </p>
              <h2 className="mt-4 display-copy text-3xl tracking-[-0.04em] md:text-5xl">
                <TextGenerateEffect words="Tailored solutions, faster execution, and one advisor across the process." />
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/68">
                At West Capital Lending, I shop wholesale pricing across
                approved lenders and investors so you do not have to. Whether
                you are buying your first home, structuring a commercial deal,
                or exploring equity options, the goal is simple: build the right
                loan for your scenario and move decisively.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Image
                  src="/carrd-assets/images/west-capital-wordmark.jpg"
                  alt="West Capital Lending"
                  width={440}
                  height={147}
                  className="h-auto w-full max-w-[220px] rounded-xl"
                />
                <Link
                  href="https://www.westcapitallending.com/team/Ellis-Andersen"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "rounded-full border-white/12 bg-white/5 text-white hover:bg-white/10"
                  )}
                >
                  About Me & WCL
                </Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 md:grid-rows-2">
              {serviceLines.map((item, index) => (
                <SpotlightCard
                  key={item.title}
                  className={cn(
                    "glass-panel rounded-[1.9rem] border-white/8 text-white",
                    index === 0 && "md:row-span-2"
                  )}
                >
                  <CardContent className="space-y-4 p-6">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-[hsl(var(--primary))]/18">
                      <Shield className="size-5 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <h3 className="display-copy text-2xl tracking-[-0.04em]">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-white/68">
                        {item.body}
                      </p>
                    </div>
                  </CardContent>
                </SpotlightCard>
              ))}
            </div>
          </section>
        </BlurFade>

        <BlurFade delay={0.1}>
          <section className="grid gap-8 lg:grid-cols-[1.06fr_0.94fr]">
            <div className="glass-panel rounded-[2.1rem] p-6 lg:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="rounded-full bg-[hsl(var(--primary))] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary-foreground))]">
                  Professional and Inclusive
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full border-white/12 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/65"
                >
                  Borrower-first guidance
                </Badge>
              </div>
              <div className="flex justify-center mb-6">
                <OrbitingCircles
                  radius={70}
                  duration={22}
                  items={[
                    <span
                      key="1"
                      className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2 py-1"
                    >
                      WCL
                    </span>,
                    <span
                      key="2"
                      className="text-xs font-bold text-seafoam bg-seafoam/10 border border-seafoam/20 rounded-full px-2 py-1"
                      style={{ color: "oklch(0.8871 0.1828 166.5465)" }}
                    >
                      FHA
                    </span>,
                    <span
                      key="3"
                      className="text-[10px] font-bold text-white/60 bg-white/5 border border-white/10 rounded-full px-2 py-1"
                    >
                      VA
                    </span>,
                    <span
                      key="4"
                      className="text-[10px] font-bold text-white/60 bg-white/5 border border-white/10 rounded-full px-2 py-1"
                    >
                      Conv
                    </span>,
                  ]}
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-500/18 border border-indigo-500/20">
                    <span className="text-lg">🏠</span>
                  </div>
                </OrbitingCircles>
              </div>
              <h2 className="mt-5 display-copy text-3xl tracking-[-0.04em] md:text-5xl">
                Mortgage guidance that feels personal, but still moves with real
                operational speed.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/68">
                The stronger content from the newer landing app stays here:
                borrower-first messaging, secure intake, educational chat, and a
                clearer explanation of next steps. The experience now sits
                inside your actual public identity and keeps borrower education
                separate from internal broker tooling.
              </p>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {[
                  "Instant soft-quote intake",
                  "Secure document guidance",
                  "TCPA-conscious borrower flows",
                  "After-hours chat assistance",
                ].map((item) => (
                  <div
                    key={item}
                    className="subtle-panel rounded-[1.25rem] px-4 py-3 text-sm text-white/72"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Star className="size-4 text-[hsl(var(--primary))]" />
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {actionLinks.map(({ label, href, icon: Icon, description }) => (
                <Link
                  key={label}
                  href={href}
                  className="glass-panel rounded-[1.7rem] p-5 transition hover:-translate-y-0.5 hover:border-white/16"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="display-copy text-2xl tracking-[-0.04em]">
                        {label}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-white/64">
                        {description}
                      </p>
                    </div>
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-[hsl(var(--primary))]/18">
                      <Icon className="size-5 text-[hsl(var(--primary))]" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </BlurFade>

        <BlurFade delay={0.1}>
          <section
            id="contact"
            className="glass-panel rounded-[2.25rem] px-6 py-7 lg:px-8"
          >
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <p className="eyebrow text-[11px] text-white/45">
                  Contact Me / Socials
                </p>
                <h2 className="display-copy text-3xl tracking-[-0.04em] md:text-5xl">
                  Everything borrowers need, in one place.
                </h2>
                <p className="max-w-2xl text-base leading-8 text-white/68">
                  If you want to buy, refinance, compare equity options, or just
                  understand what is realistic before you make a move, use the
                  quote wizard above or contact me directly.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    href={contact.phoneHref}
                    className={cn(
                      buttonVariants({}),
                      "h-11 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90"
                    )}
                  >
                    <Phone className="size-4" />
                    Call {contact.phone}
                  </Link>
                  <Link
                    href={contact.emailHref}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-11 rounded-full border-white/12 bg-white/5 text-white hover:bg-white/10"
                    )}
                  >
                    <Mail className="size-4" />
                    Email Me
                  </Link>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="subtle-panel rounded-[1.5rem] p-5">
                  <p className="eyebrow text-[10px] text-white/40">Office</p>
                  <p className="mt-3 text-sm leading-7 text-white/74">
                    {contact.company}
                  </p>
                  <p className="text-sm leading-7 text-white/74">
                    {contact.address}
                  </p>
                </div>
                <div className="subtle-panel rounded-[1.5rem] p-5">
                  <p className="eyebrow text-[10px] text-white/40">
                    Verification and Profiles
                  </p>
                  <div className="mt-3 grid gap-2 text-sm text-white/74">
                    {socials.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="hover:text-white"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </BlurFade>

        <footer className="px-2 pb-2 pt-2 text-center">
          <Image
            src="/ratehunter-footer-logo.png"
            alt="RateHunter"
            width={220}
            height={70}
            className="mx-auto h-auto w-full max-w-[220px]"
          />
          <p className="mx-auto mt-5 max-w-4xl fine-print">
            Mortgage services are subject to lender review, borrower
            qualification, and market conditions. Equal Housing Opportunity.
            Ellis Andersen | NMLS 1912260 | West Capital Lending Company NMLS
            1566096 | DRE 02196940 | Company DRE 02022356.
          </p>
          <p className="mx-auto mt-3 max-w-4xl fine-print">
            Educational guidance only until a full application, disclosures, and
            lender review are completed. The chat assistant and intake tools
            support borrower education and lead routing, not a binding credit
            decision.
          </p>
        </footer>
      </div>

      <BorrowerChatWidget />
      <RateLockWidget
        rate={best?.rate ?? 6.375}
        lender={best?.name ?? "Best Rate"}
      />
    </main>
  );
}
