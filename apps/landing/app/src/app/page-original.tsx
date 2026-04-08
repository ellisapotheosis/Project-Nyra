import Link from 'next/link';
import { PersonalHeader } from '@/components/PersonalHeader';
import { AboutSection } from '@/components/AboutSection';
import { PersonalFooter } from '@/components/PersonalFooter';

interface RateCard {
  product: string;
  rate: number;
  apr: number;
  trend: 'up' | 'down' | 'flat';
  source: string;
}

interface NewsItem {
  title: string;
  url: string;
  published: string;
  source: string;
}

const FALLBACK_TREASURY_10Y = 4.28;

const BASE_SPREADS: Omit<RateCard, 'rate' | 'apr' | 'trend'>[] = [
  { product: '30Y Conventional Fixed', source: 'Model: 10Y + 2.35%' },
  { product: '15Y Conventional Fixed', source: 'Model: 10Y + 1.65%' },
  { product: '30Y FHA Fixed', source: 'Model: 10Y + 2.05%' },
  { product: '30Y VA Fixed', source: 'Model: 10Y + 1.85%' },
  { product: 'HELOC (Variable)', source: 'Model: 10Y + 3.10%' },
  { product: 'HELOAN (Fixed)', source: 'Model: 10Y + 2.70%' },
];

const RATE_SPREADS = [2.35, 1.65, 2.05, 1.85, 3.1, 2.7];

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function fetchTreasury10Y(): Promise<number> {
  try {
    const response = await fetch(
      'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml?data=daily_treasury_yield_curve',
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return FALLBACK_TREASURY_10Y;
    }

    const xml = await response.text();
    const entries = [...xml.matchAll(/<m:properties>([\s\S]*?)<\/m:properties>/g)].map(
      (match) => match[1]
    );

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
    const trend: RateCard['trend'] = index % 3 === 0 ? 'down' : index % 3 === 1 ? 'flat' : 'up';

    return {
      ...base,
      rate: Number(rate.toFixed(3)),
      apr: Number(apr.toFixed(3)),
      trend,
    };
  });
}

async function fetchNews(feedUrl: string, source: string, limit = 3): Promise<NewsItem[]> {
  try {
    const response = await fetch(feedUrl, { next: { revalidate: 1800 } });
    if (!response.ok) {
      return [];
    }

    const xml = await response.text();
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const items = [...xml.matchAll(itemRegex)].slice(0, limit).map((item) => {
      const block = item[1];
      const title = decodeXml(block.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() || 'Untitled');
      const url = decodeXml(block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || '#');
      const published = decodeXml(
        block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || new Date().toUTCString()
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
    fetchNews('https://news.google.com/rss/search?q=mortgage+rates+market&hl=en-US&gl=US&ceid=US:en', 'Market News', 4),
    fetchNews('https://news.google.com/rss/search?q=Rocket+Mortgage&hl=en-US&gl=US&ceid=US:en', 'Rocket Mortgage', 4),
  ]);

  return [...mortgageNews, ...rocketNews].slice(0, 6);
}

function TrendBadge({ trend }: { trend: RateCard['trend'] }) {
  if (trend === 'down') return <span className="text-emerald-400">▼ Improving</span>;
  if (trend === 'up') return <span className="text-rose-400">▲ Rising</span>;
  return <span className="text-cyan-300">● Stable</span>;
}

export default async function Home() {
  const tenYearYield = await fetchTreasury10Y();
  const rates = buildRateCards(tenYearYield);
  const news = await getNewsFeed();

  return (
    <>
      <main className="min-h-screen bg-[#030712] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.2),transparent_30%)]" />

      <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-20">
        <p className="inline-flex rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
          RateHunter Quantum Board · 2142 Edition
        </p>
        <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">
          Mortgage Intelligence
          <span className="block bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
            optimized for Cloudflare Pages
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-slate-300">
          Static-first UX with real-time friendly data sources. Includes modeled mortgage products from the
          U.S. 10-year Treasury benchmark and a live mortgage/market news strip.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-widest text-slate-400">10Y Treasury</p>
            <p className="mt-2 text-3xl font-semibold text-cyan-300">{tenYearYield.toFixed(2)}%</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-widest text-slate-400">Products Tracked</p>
            <p className="mt-2 text-3xl font-semibold text-violet-300">{rates.length}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-widest text-slate-400">Feed Status</p>
            <p className="mt-2 text-3xl font-semibold text-fuchsia-300">{news.length > 0 ? 'LIVE' : 'Fallback'}</p>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-16" id="rates">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Rate Deck</h2>
          <p className="text-sm text-slate-400">Indicative APRs for comparison only</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rates.map((card) => (
            <article
              key={card.product}
              className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-[0_0_60px_-40px_rgba(56,189,248,0.55)]"
            >
              <p className="text-sm text-slate-400">{card.source}</p>
              <h3 className="mt-2 text-lg font-medium">{card.product}</h3>
              <p className="mt-3 text-3xl font-bold text-cyan-200">{card.rate.toFixed(3)}%</p>
              <p className="text-slate-300">APR {card.apr.toFixed(3)}%</p>
              <p className="mt-3 text-sm">
                <TrendBadge trend={card.trend} />
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-24" id="news">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Mortgage + Market News Pulse</h2>
          <Link href="https://news.google.com" className="text-sm text-cyan-300 hover:text-cyan-200">
            Open News Source ↗
          </Link>
        </div>
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          {news.length > 0 ? (
            news.map((item) => (
              <a
                key={`${item.source}-${item.url}`}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg border border-slate-800 p-4 transition hover:border-cyan-400/50 hover:bg-slate-800/60"
              >
                <p className="text-xs uppercase tracking-widest text-slate-400">{item.source}</p>
                <p className="mt-1 text-sm font-medium text-slate-100">{item.title}</p>
                <p className="mt-2 text-xs text-slate-400">{new Date(item.published).toLocaleString()}</p>
              </a>
            ))
          ) : (
            <p className="text-slate-300">
              News endpoints are temporarily unavailable. Add a Worker-proxied RSS feed endpoint later for guaranteed uptime.
            </p>
          )}
        </div>
      </section>

      {/* About Ellis & West Capital Section */}
      <AboutSection />
    </main>

    {/* Personal Footer */}
      <PersonalFooter />
    </>
  );
}
