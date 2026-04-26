import { Calculator, Clock, Lock, TrendingDown, TrendingUp, WifiOff } from "lucide-react"
import { unstable_noStore as noStore } from "next/cache"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCrmWorkspaceData } from "@/lib/crm-data"
import { quoteProducts } from "@/lib/mock-data"

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function estimateMonthlyPayment(amount: number, ratePercent: number, termYears = 30) {
  const monthlyRate = ratePercent / 100 / 12
  const payments = termYears * 12
  return Math.round((amount * (monthlyRate * Math.pow(1 + monthlyRate, payments))) / (Math.pow(1 + monthlyRate, payments) - 1))
}

export default async function QuotesPage() {
  noStore()
  const { applications, source } = await getCrmWorkspaceData()
  const averageRate = quoteProducts.reduce((sum, quote) => sum + quote.rate, 0) / quoteProducts.length
  const recentQuotes = applications.slice(0, 3).map((application, index) => {
    const product = quoteProducts[index % quoteProducts.length]
    return {
      borrower: application.borrower,
      product: product.product,
      amount: application.amount,
      payment: estimateMonthlyPayment(application.amount, product.rate, product.product.startsWith("15Y") ? 15 : 30),
      status: application.status,
      expires: new Date(Date.now() + (index + 3) * 86400000).toISOString().slice(0, 10),
    }
  })
  const lockedCount = recentQuotes.filter((quote) => quote.status.toLowerCase().includes("lock")).length
  const expiringSoon = recentQuotes.filter((quote) => {
    return Date.parse(quote.expires) - Date.now() < 1000 * 60 * 60 * 24 * 7
  }).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Quote Desk</h1>
          <p className="mt-2 text-muted-foreground">
            Rate quoting surface adapted from the admin app, with the websocket dependency removed for now.
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.24em] text-primary/80">Source: {source}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-sm text-muted-foreground">
          <WifiOff className="size-4 text-amber-300" />
          Live websocket feed not wired yet. Rate sheet is local, borrower/application list is CRM-backed when available.
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
          <CardContent className="text-3xl font-semibold">{recentQuotes.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="size-4" />
              Locked Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{lockedCount}</CardContent>
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
          <CardContent className="text-3xl font-semibold">{expiringSoon}</CardContent>
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
            {recentQuotes.length === 0 && (
              <div className="rounded-2xl border border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
                No application records available yet. Add `CRM_API_URL`, `TWENTY_MCP_URL`, or `TWENTY_CRM_URL` to populate this panel.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
