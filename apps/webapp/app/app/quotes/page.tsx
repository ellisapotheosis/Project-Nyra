import { Calculator, Clock, Lock, TrendingDown, TrendingUp, WifiOff } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { quoteProducts } from "@/lib/mock-data"

const recentQuotes = [
  {
    borrower: "Sarah Johnson",
    product: "30Y Conventional Fixed",
    amount: 450000,
    payment: 2967,
    status: "Active",
    expires: "2026-05-01",
  },
  {
    borrower: "Michael Chen",
    product: "30Y FHA Fixed",
    amount: 325000,
    payment: 2057,
    status: "Locked",
    expires: "2026-04-28",
  },
  {
    borrower: "Lisa Rodriguez",
    product: "15Y Conventional Fixed",
    amount: 275000,
    payment: 2366,
    status: "Expired",
    expires: "2026-04-18",
  },
]

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export default function QuotesPage() {
  const averageRate = quoteProducts.reduce((sum, quote) => sum + quote.rate, 0) / quoteProducts.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Quote Desk</h1>
          <p className="mt-2 text-muted-foreground">
            Rate quoting surface adapted from the admin app, with the websocket dependency removed for now.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-sm text-muted-foreground">
          <WifiOff className="size-4 text-amber-300" />
          Live websocket feed not wired yet. Showing local fallback rates.
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calculator className="size-4" />
              Active Quotes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">3</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="size-4" />
              Locked Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">1</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="size-4" />
              Average Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{averageRate.toFixed(3)}%</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">2</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Current Rate Sheet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quoteProducts.map((product) => (
              <div
                key={product.product}
                className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/40 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">{product.product}</p>
                  <p className="text-sm text-muted-foreground">APR {product.apr.toFixed(3)}% • {product.points} points</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold">{product.rate.toFixed(3)}%</p>
                    <p className="text-xs text-muted-foreground">{product.change}</p>
                  </div>
                  {product.trend === "up" ? (
                    <TrendingUp className="size-4 text-rose-300" />
                  ) : product.trend === "down" ? (
                    <TrendingDown className="size-4 text-emerald-300" />
                  ) : (
                    <Clock className="size-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Quotes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentQuotes.map((quote) => (
              <div key={`${quote.borrower}-${quote.product}`} className="rounded-2xl border border-border/60 bg-background/40 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{quote.borrower}</p>
                    <p className="text-sm text-muted-foreground">{quote.product}</p>
                  </div>
                  <span className="rounded-full border border-border/60 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {quote.status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <div>Loan amount: {currency(quote.amount)}</div>
                  <div>Payment: {currency(quote.payment)}</div>
                  <div className="col-span-2">Lock expires: {quote.expires}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
