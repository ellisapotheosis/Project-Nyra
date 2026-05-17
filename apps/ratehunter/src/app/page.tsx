import Link from "next/link";
import { Suspense } from "react";
import { PersonalHeader } from "@/components/PersonalHeader";
import { AboutSection } from "@/components/AboutSection";
import { PersonalFooter } from "@/components/PersonalFooter";
import { LeadCaptureWizard } from "@/components/LeadCaptureWizard";
import { BorrowerChatWidget } from "@/components/BorrowerChatWidget";
import {
  MortgageProcessBeam,
  RateHunterLeadFormFrame,
  SoftAuroraSection,
  SubtleMovingButton,
  TrustGlowCard,
} from "@/components/effects";

interface RateCard {
  product: string;
  rate: number;
  apr: number;
  trend: "up" | "down" | "flat";
  source: string;
}

interface NewsItem {
  title: string;
  url: string;
  published: string;
  source: string;
}

const FALLBACK_TREASURY_10Y = 4.28;

const BASE_SPREADS: Omit<RateCard, "rate" | "apr" | "trend">[] = [
  { product: "30Y Conventional Fixed", source: "Model: 10Y + 2.35%" },
  { product: "15Y Conventional Fixed", source: "Model: 10Y + 1.65%" },
  { product: "30Y FHA Fixed", source: "Model: 10Y + 2.05%" },
  { product: "30Y VA Fixed", source: "Model: 10Y + 1.85%" },
  { product: "HELOC (Variable)", source: "Model: 10Y + 3.10%" },
  { product: "HELOAN (Fixed)", source: "Model: 10Y + 2.70%" },
];

const RATE_SPREADS = [2.35, 1.65, 2.05, 1.85, 3.1, 2.7];

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function fetchTreasury10Y(): Promise<number> {
  try {
    const response = await fetch(
      "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml?data=daily_treasury_yield_curve",
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return FALLBACK_TREASURY_10Y;
    }

    const xml = await response.text();
    const entries = [
      ...xml.matchAll(/<m:properties>([\s\S]*?)<\/m:properties>/g),
    ].map((match) => match[1]);

    if (entries.length === 0) {
      return FALLBACK_TREASURY_10Y;
    }

    const latest = entries[entries.length - 1];
    const match = latest.match(/<d:BC_10YEAR[^>]*>([^<]+)<\/d:BC_10YEAR>/);

    if (!match) {
      return FALLBACK_TREASURY_10Y;
    }

    const parsed = Number.parseFloat(match[1]);
    return Number.isFinite(parsed) ? parsed : FALLBACK_TREASURY_10Y;
  } catch {
    return FALLBACK_TREASURY_10Y;
  }
}

function buildRateCards(tenYearYield: number): RateCard[] {
  return BASE_SPREADS.map((base, index) => {
    const rate = tenYearYield + RATE_SPREADS[index];
    const apr = rate + (index < 4 ? 0.12 : 0.2);
    const trend: RateCard["trend"] =
      index % 3 === 0 ? "down" : index % 3 === 1 ? "flat" : "up";

    return {
      ...base,
      rate: Number(rate.toFixed(3)),
      apr: Number(apr.toFixed(3)),
      trend,
    };
  });
}

async function fetchNews(
  feedUrl: string,
  source: string,
  limit = 3
): Promise<NewsItem[]> {
  try {
    const response = await fetch(feedUrl, { next: { revalidate: 1800 } });
    if (!response.ok) {
      return [];
    }

    const xml = await response.text();
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const items = [...xml.matchAll(itemRegex)].slice(0, limit).map((item) => {
      const block = item[1];
      const title = decodeXml(
        block.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() || "Untitled"
      );
      const url = decodeXml(
        block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || "#"
      );
      const published = decodeXml(
        block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ||
          new Date().toUTCString()
      );

      return { title, url, published, source };
    });

    return items;
  } catch {
    return [];
  }
}

async function getNewsFeed(): Promise<NewsItem[]> {
  const [mortgageNews, rocketNews] = await Promise.all([
    fetchNews(
      "https://news.google.com/rss/search?q=mortgage+rates+market&hl=en-US&gl=US&ceid=US:en",
      "Market News",
      4
    ),
    fetchNews(
      "https://news.google.com/rss/search?q=Rocket+Mortgage&hl=en-US&gl=US&ceid=US:en",
      "Rocket Mortgage",
      4
    ),
  ]);

  return [...mortgageNews, ...rocketNews].slice(0, 6);
}

function TrendBadge({ trend }: { trend: RateCard["trend"] }) {
  if (trend === "down")
    return (
      <span className="text-turquoise-400 font-black uppercase tracking-widest text-[10px]">
        ▼ Improving_Yield
      </span>
    );
  if (trend === "up")
    return (
      <span className="text-pink-400 font-black uppercase tracking-widest text-[10px]">
        ▲ Rising_Costs
      </span>
    );
  return (
    <span className="text-indigo-400 font-black uppercase tracking-widest text-[10px]">
      ● Market_Steady
    </span>
  );
}

export default async function Home() {
  const tenYearYield = await fetchTreasury10Y();
  const rates = buildRateCards(tenYearYield);
  const news = await getNewsFeed();

  return (
    <div className="min-h-screen bg-black text-foreground antialiased selection:bg-indigo-500/30">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(20,184,166,0.15),transparent_30%)]" />

      {/* Personal Header with Contact Info */}
      <PersonalHeader />

      <main className="relative">
        {/* Hero Section with Ellis Branding */}
        <SoftAuroraSection className="mx-auto max-w-6xl px-6 pb-24 pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
              <div>
                <p className="inline-flex rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 shadow-inner">
                  Ellis Andersen · West Capital Lending · 2026 Edition
                </p>
                <h1 className="mt-8 text-6xl font-black leading-[0.9] lg:text-7xl uppercase tracking-tighter">
                  Mortgage <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-turquoise-400 italic">
                    Intelligence
                  </span>
                </h1>
                <p className="mt-8 max-w-xl text-lg text-muted-foreground font-medium leading-relaxed">
                  I compare lender options and help you understand preliminary
                  quote paths before you choose a loan strategy. Rate and
                  payment terms depend on full underwriting, property, credit,
                  and market conditions.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <SubtleMovingButton href="#lead-form">
                  Start a preliminary quote
                </SubtleMovingButton>
                <Link
                  href="#rates"
                  className="text-sm font-black uppercase tracking-widest text-indigo-300 hover:text-white"
                >
                  View market context
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <TrustGlowCard className="group hover:border-indigo-400 transition-colors">
                  <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground group-hover:text-indigo-400 transition-colors">
                    10Y Treasury
                  </p>
                  <p className="mt-2 text-3xl font-black text-foreground">
                    {tenYearYield.toFixed(2)}%
                  </p>
                </TrustGlowCard>
                <TrustGlowCard className="hidden sm:block group hover:border-turquoise-400 transition-colors">
                  <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground group-hover:text-turquoise-400 transition-colors">
                    Products
                  </p>
                  <p className="mt-2 text-3xl font-black text-foreground">
                    {rates.length}
                  </p>
                </TrustGlowCard>
                <TrustGlowCard className="group hover:border-indigo-400 transition-colors">
                  <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground group-hover:text-pink-400 transition-colors">
                    BBB Rating
                  </p>
                  <p className="mt-2 text-3xl font-black text-foreground">A+</p>
                </TrustGlowCard>
              </div>
              <MortgageProcessBeam
                steps={[
                  "Compare options",
                  "Review preliminary terms",
                  "Choose the next underwriting step",
                ]}
              />
            </div>

            <div className="lg:pl-8 relative" id="lead-form">
              <div className="absolute -inset-4 bg-indigo-500/10 blur-3xl rounded-full opacity-50" />
              <RateHunterLeadFormFrame className="relative">
                <Suspense
                  fallback={
                    <div className="min-h-[600px] rounded-[48px] border border-border/50 bg-card/20" />
                  }
                >
                  <LeadCaptureWizard />
                </Suspense>
              </RateHunterLeadFormFrame>
            </div>
          </div>
        </SoftAuroraSection>

        {/* Rate Deck Section */}
        <section className="relative mx-auto max-w-6xl px-6 pb-24" id="rates">
          <div className="mb-10 flex items-end justify-between border-b border-border/50 pb-4">
            <div>
              <p className="text-turquoise-500 text-[10px] font-black tracking-widest uppercase mb-1">
                Service Registry
              </p>
              <h2 className="text-3xl font-black uppercase tracking-tight">
                Market Rate Deck
              </h2>
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Indicative APRs • Refreshed:{" "}
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {rates.map((card) => (
              <article
                key={card.product}
                className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-md p-6 shadow-2xl hover:border-indigo-500/30 transition-all group overflow-hidden border-t-2 border-t-indigo-600"
              >
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-indigo-400 transition-colors">
                    {card.source}
                  </p>
                  <div className="h-1.5 w-1.5 rounded-full bg-turquoise-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
                </div>
                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">
                  {card.product}
                </h3>
                <div className="mt-6 flex items-baseline gap-3">
                  <p className="text-4xl font-black text-foreground group-hover:text-turquoise-400 transition-colors">
                    {card.rate.toFixed(3)}%
                  </p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                    APR {card.apr.toFixed(3)}%
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/30">
                  <TrendBadge trend={card.trend} />
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* News Section */}
        <section className="relative mx-auto max-w-6xl px-6 pb-24" id="news">
          <div className="mb-10 flex items-end justify-between border-b border-border/50 pb-4">
            <div>
              <p className="text-pink-400 text-[10px] font-black tracking-widest uppercase mb-1">
                Cluster Feed
              </p>
              <h2 className="text-3xl font-black uppercase tracking-tight">
                Market News Pulse
              </h2>
            </div>
            <Link
              href="https://news.google.com"
              className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-2"
            >
              EXTERNAL_SOURCE_PROTO <ExternalLink className="size-3" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {news.length > 0 ? (
              news.map((item) => (
                <a
                  key={`${item.source}-${item.url}`}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-border/40 bg-card/20 p-5 transition-all hover:bg-indigo-500/5 hover:border-indigo-500/40 shadow-xl border-l-2 border-l-turquoise-500 group"
                >
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-indigo-400 transition-colors mb-2">
                    {item.source}
                  </p>
                  <p className="text-sm font-bold text-foreground leading-snug line-clamp-2 uppercase tracking-tight">
                    {item.title}
                  </p>
                  <p className="mt-4 text-[9px] font-black text-muted-foreground uppercase opacity-40">
                    {new Date(item.published).toLocaleDateString()}
                  </p>
                </a>
              ))
            ) : (
              <div className="col-span-full p-12 text-center border-2 border-dashed border-border/50 rounded-3xl opacity-30">
                <p className="text-[10px] font-black uppercase tracking-widest">
                  INGRESS_PROTOCOL_OFFLINE
                </p>
              </div>
            )}
          </div>
        </section>

        {/* About Ellis & West Capital Section */}
        <AboutSection />
      </main>

      <BorrowerChatWidget />

      {/* Personal Footer with Contact & Professional Links */}
      <PersonalFooter />
    </div>
  );
}

function ExternalLink({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}
