export interface RateCard {
  product: string;
  rate: number;
  apr: number;
  trend: 'up' | 'down' | 'flat';
  source: string;
}

export interface NewsItem {
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

export async function fetchTreasury10Y(): Promise<number> {
  try {
    const response = await fetch(
      'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml?data=daily_treasury_yield_curve',
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return FALLBACK_TREASURY_10Y;
    }

    const xml = await response.text();
    const entries = [...xml.matchAll(/<m:properties>([\s\S]*?)<\/m:properties>/g)].map((match) => match[1]);

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

export function buildRateCards(tenYearYield: number): RateCard[] {
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

export async function getNewsFeed(): Promise<NewsItem[]> {
  const [mortgageNews, rocketNews] = await Promise.all([
    fetchNews(
      'https://news.google.com/rss/search?q=mortgage+rates+market&hl=en-US&gl=US&ceid=US:en',
      'Market News',
      4
    ),
    fetchNews(
      'https://news.google.com/rss/search?q=Rocket+Mortgage&hl=en-US&gl=US&ceid=US:en',
      'Rocket Mortgage',
      4
    ),
  ]);

  return [...mortgageNews, ...rocketNews].slice(0, 6);
}
