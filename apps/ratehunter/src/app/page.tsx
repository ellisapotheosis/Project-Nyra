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
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  return (
    <main className="relative min-h-screen pb-20 text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Cinematic Background */}
      <div className="fixed inset-0 -z-10 bg-[#000000]">
        <div className="absolute top-[-10%] left-[-10%] size-[60%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] size-[60%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute top-[30%] right-[5%] size-[40%] rounded-full bg-indigo-500/5 blur-[100px]" />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-24 pt-6 md:px-6 lg:px-8">
        import {ThemeSwitcher} from "@/components/theme-switcher"; ...
        <nav className="glass-panel sticky top-4 z-40 flex items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-black/40 px-6 py-3 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/20 text-indigo-400 shadow-[0_0_20px_-5px_rgba(var(--indigo-rgb),0.5)]">
              <Landmark className="size-5" />
            </span>
            <span className="text-xl font-black tracking-tighter text-white uppercase italic">
              RateHunter
            </span>
          </div>
          <div className="hidden items-center gap-6 text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 md:flex">
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
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Link
              href={contact.calendly}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-9 rounded-xl border-indigo-500/30 bg-indigo-500/10 px-5 text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all"
              )}
            >
              Consult
            </Link>
          </div>
        </nav>
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="glass-panel overflow-hidden rounded-[48px] border-white/10 bg-black/40 shadow-2xl">
            <div className="grid gap-10 px-6 py-8 2xl:grid-cols-[0.92fr_1.08fr] lg:px-12 lg:py-12">
              <div className="space-y-6">
                <div className="overflow-hidden rounded-[32px] border border-white/10 bg-black/20 shadow-2xl">
                  <Image
                    src="/carrd-assets/images/ellis-portrait.jpg"
                    alt="Ellis Andersen portrait"
                    width={840}
                    height={840}
                    className="aspect-square h-auto w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <div className="glass-card rounded-[28px] p-5">
                  <p className="eyebrow text-[10px] text-white/30 tracking-[0.3em]">
                    Digital Access
                  </p>
                  <Image
                    src="/carrd-assets/images/ellis-contact-card.jpg"
                    alt="Ellis Andersen contact card"
                    width={600}
                    height={600}
                    className="mt-4 h-auto w-full rounded-[20px] shadow-lg"
                  />
                </div>
              </div>

              <div className="space-y-10">
                <div className="flex flex-wrap gap-2.5">
                  {contact.roles.map((role) => (
                    <Badge
                      key={role}
                      variant="secondary"
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.25em] text-white/60"
                    >
                      {role}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-6">
                  <p className="eyebrow text-[11px] text-white/40 tracking-[0.3em]">
                    {contact.company}
                  </p>
                  <h1 className="display-copy text-5xl leading-[0.95] tracking-[-0.05em] text-balance md:text-7xl font-black">
                    Ellis Andersen
                  </h1>
                  <p className="max-w-2xl text-xl leading-relaxed text-white/60 font-medium">
                    Your trusted mortgage partner for residential, commercial,
                    refinance, HELOC, and real estate strategy. I shop wholesale
                    lender pricing, move quickly, and tailor the loan structure
                    around your actual financial profile.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Link
                    href={contact.calendly}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "h-14 rounded-2xl bg-indigo-600 px-6 text-sm font-bold uppercase tracking-widest text-white shadow-xl shadow-indigo-600/40 hover:bg-indigo-500 hover:-translate-y-0.5 transition-all"
                    )}
                  >
                    <CalendarDays className="size-5" />
                    Schedule Time
                  </Link>
                  <a
                    href="#quote"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "h-14 rounded-2xl border-white/10 bg-white/5 px-6 text-sm font-bold uppercase tracking-widest text-white hover:bg-white/10 hover:-translate-y-0.5 transition-all"
                    )}
                  >
                    <Sparkles className="size-5 text-indigo-400" />
                    Start Quote
                  </a>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="glass-card rounded-[28px] p-6">
                    <p className="eyebrow text-[10px] text-white/30 tracking-[0.25em]">
                      Direct Contact
                    </p>
                    <div className="mt-5 grid gap-4 text-sm text-white/80 font-medium">
                      <Link
                        href={contact.emailHref}
                        className="inline-flex items-center gap-3 hover:text-white transition-colors"
                      >
                        <Mail className="size-4.5 text-indigo-400" />
                        <span className="truncate">{contact.email}</span>
                      </Link>
                      <p className="inline-flex items-center gap-3">
                        <Phone className="size-4.5 text-indigo-400" />
                        {contact.phone}
                      </p>
                      <p className="inline-flex items-start gap-3">
                        <MapPin className="mt-0.5 size-4.5 shrink-0 text-indigo-400" />
                        <span className="leading-relaxed">
                          {contact.address}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="glass-card rounded-[28px] p-6">
                    <p className="eyebrow text-[10px] text-white/30 tracking-[0.25em]">
                      Credentials
                    </p>
                    <div className="mt-5 grid gap-3 text-sm text-white/60 font-medium leading-relaxed">
                      <p>NMLS 1912260 | Company NMLS 1566096</p>
                      <p>DRE 02196940 | Company DRE 02022356</p>
                      <p>Fax: {contact.fax}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="quote" className="space-y-6">
            <div className="glass-panel rounded-[40px] p-8 border-white/10 bg-black/40 shadow-2xl">
              <p className="eyebrow text-[10px] text-white/30 tracking-[0.3em]">
                Borrower Intake
              </p>
              <h2 className="mt-4 display-copy text-4xl font-black tracking-[-0.04em] leading-[1.1]">
                Simple, fast scenario reviews.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/60 font-medium">
                Share the basics for a professional scenario review. This is an
                intake request for broker follow-up, not a binding loan
                estimate.
              </p>
              <p className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-[11px] leading-relaxed text-white/40 font-medium italic">
                By submitting, you authorize contact by phone, SMS, and email.
                Reply STOP to texts to opt out. Your info is routed through
                secure server-side intake boundaries.
              </p>
            </div>
            <LeadCaptureWizard />
          </div>
        </section>
        <section className="glass-panel overflow-hidden rounded-[32px] border-white/10 bg-black/40 shadow-xl">
          <div className="flex flex-col gap-6 border-b border-white/10 px-8 py-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow text-[10px] text-white/30 tracking-[0.3em]">
                Market Pulse
              </p>
              <h2 className="mt-3 display-copy text-3xl font-black tracking-[-0.04em] leading-tight">
                Rate context for better conversations.
              </h2>
            </div>
            <Link
              href={contact.calendly}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded-xl border-white/10 bg-white/5 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-all"
              )}
            >
              <CalendarDays className="size-4 mr-2" />
              Talk through timing
            </Link>
          </div>
          <div className="market-ticker border-b border-white/5 bg-white/5">
            <div className="market-ticker-track">
              {[...marketPulse, ...marketPulse].map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="inline-flex min-w-max items-center gap-4 px-8 py-4 text-xs font-bold uppercase tracking-widest"
                >
                  <TrendingUp className="size-4 text-indigo-400" />
                  <span className="text-white/80">{item.label}</span>
                  <Badge
                    variant="outline"
                    className="rounded-full border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[9px] text-indigo-400"
                  >
                    {item.value}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
            {marketPulse.map((item) => (
              <div
                key={item.label}
                className="glass-card rounded-[24px] p-5 border-white/5"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-white/80">
                  {item.label}
                </p>
                <p className="mt-3 text-[11px] leading-relaxed text-white/40 font-medium">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="pt-4 px-2">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {trustPoints.map((point) => (
              <div
                key={point}
                className="glass-card rounded-[24px] border-white/5 bg-transparent p-6 text-white"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 size-5 shrink-0 rounded-full bg-indigo-500/20 grid place-items-center">
                    <CheckCircle2 className="size-3 text-indigo-400" />
                  </div>
                  <p className="text-xs leading-relaxed text-white/60 font-medium">
                    {point}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section
          id="services"
          className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]"
        >
          <div className="glass-panel rounded-[2.1rem] p-6 lg:p-8">
            <p className="eyebrow text-[11px] text-white/45">
              Advisory Approach
            </p>
            <h2 className="mt-4 display-copy text-3xl tracking-[-0.04em] md:text-5xl">
              Tailored solutions, faster execution, and one advisor across the
              process.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/68">
              At West Capital Lending, I shop wholesale pricing across approved
              lenders and investors so you do not have to. Whether you are
              buying your first home, structuring a commercial deal, or
              exploring equity options, the goal is simple: build the right loan
              for your scenario and move decisively.
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

          <div className="grid gap-4 md:grid-cols-2">
            {serviceLines.map((item) => (
              <Card
                key={item.title}
                className="glass-panel rounded-[1.9rem] border-white/8 bg-transparent py-0 text-white shadow-none"
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
              </Card>
            ))}
          </div>
        </section>
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
            <h2 className="mt-5 display-copy text-3xl tracking-[-0.04em] md:text-5xl">
              Mortgage guidance that feels personal, but still moves with real
              operational speed.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/68">
              The stronger content from the newer landing app stays here:
              borrower-first messaging, secure intake, educational chat, and a
              clearer explanation of next steps. The experience now sits inside
              your actual public identity and keeps borrower education separate
              from internal broker tooling.
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
    </main>
  );
}
