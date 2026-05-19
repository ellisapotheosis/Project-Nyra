'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Lock,
  Plus,
  Search,
  Filter,
  Wifi,
  WifiOff,
  RefreshCw,
  ExternalLink,
  Download,
  DollarSign
} from 'lucide-react'
import { useRealTimeRates, useWebSocket } from '@/hooks/useWebSocket'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

// Mock quote data
const currentRates = [
  {
    product: '30Y Conventional Fixed',
    rate: 6.875,
    apr: 6.952,
    points: 0,
    trend: 'up' as const,
    change: '+0.125',
    lastUpdate: '2026-03-10T16:30:00Z'
  },
  {
    product: '15Y Conventional Fixed',
    rate: 6.250,
    apr: 6.341,
    points: 0,
    trend: 'down' as const,
    change: '-0.250',
    lastUpdate: '2026-03-10T16:30:00Z'
  },
  {
    product: '30Y FHA Fixed',
    rate: 6.500,
    apr: 7.245,
    points: 0,
    trend: 'stable' as const,
    change: '0.000',
    lastUpdate: '2026-03-10T16:30:00Z'
  },
  {
    product: '30Y VA Fixed',
    rate: 6.375,
    apr: 6.621,
    points: 0,
    trend: 'up' as const,
    change: '+0.125',
    lastUpdate: '2026-03-10T16:30:00Z'
  },
  {
    product: 'HELOC (Variable)',
    rate: 9.250,
    apr: 9.250,
    points: 0,
    trend: 'stable' as const,
    change: '0.000',
    lastUpdate: '2026-03-10T16:30:00Z'
  },
  {
    product: 'HELOAN (Fixed)',
    rate: 8.750,
    apr: 8.950,
    points: 0,
    trend: 'down' as const,
    change: '-0.125',
    lastUpdate: '2026-03-10T16:30:00Z'
  },
]

const recentQuotes = [
  {
    id: 'quote-001',
    borrower: 'Sarah Johnson',
    loanAmount: 450000,
    product: '30Y Conventional',
    rate: 6.875,
    monthlyPayment: 2967,
    status: 'active',
    lockExpires: '2026-03-25',
    createdAt: '2026-03-10T14:30:00Z'
  },
  {
    id: 'quote-002',
    borrower: 'Michael Chen',
    loanAmount: 325000,
    product: '30Y FHA',
    rate: 6.500,
    monthlyPayment: 2057,
    status: 'locked',
    lockExpires: '2026-03-20',
    createdAt: '2026-03-10T11:15:00Z'
  },
  {
    id: 'quote-003',
    borrower: 'Lisa Rodriguez',
    loanAmount: 275000,
    product: '15Y Conventional',
    rate: 6.250,
    monthlyPayment: 2366,
    status: 'expired',
    lockExpires: '2026-03-08',
    createdAt: '2026-03-01T09:22:00Z'
  },
]

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-red-400" />
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-green-400" />
  return <Minus className="h-4 w-4 text-slate-400" />
}

function getTrendColor(trend: 'up' | 'down' | 'stable') {
  if (trend === 'up') return 'text-red-400'
  if (trend === 'down') return 'text-green-400'
  return 'text-slate-400'
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20'
    case 'locked':
      return 'bg-green-400/10 text-green-300 border-green-400/20'
    case 'expired':
      return 'bg-red-400/10 text-red-300 border-red-400/20'
    default:
      return 'bg-slate-400/10 text-slate-300 border-slate-400/20'
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export default function QuotesPage() {
  const { user, hasPermission } = useAuth()
  const { rates, lastUpdate, connected } = useRealTimeRates()
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Use real-time rates if available, fallback to mock data
  const displayRates = rates.length > 0 ? rates : currentRates.map(rate => ({
    ...rate,
    id: rate.product,
    lastUpdated: rate.lastUpdate
  }))

  const filteredQuotes = recentQuotes.filter(quote => {
    const matchesSearch = quote.borrower.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.product.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || quote.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const activeQuotes = recentQuotes.filter(q => q.status === 'active').length
  const lockedQuotes = recentQuotes.filter(q => q.status === 'locked').length
  const avgRate = displayRates.reduce((sum, rate) => sum + rate.rate, 0) / displayRates.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Quote Desk</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-400">
              Real-time rates and quote management
            </p>
            <div className="flex items-center gap-1.5">
              {connected ? (
                <><Wifi className="h-4 w-4 text-green-400" />
                <span className="text-xs text-green-400">Live</span></>
              ) : (
                <><WifiOff className="h-4 w-4 text-red-400" />
                <span className="text-xs text-red-400">Offline</span></>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasPermission('quotes:create') && (
            <Button
              className="btn-primary"
              onClick={() => setShowQuoteForm(true)}
            >
              <Plus className="h-4 w-4" />
              Generate Quote
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Active Quotes
            </CardTitle>
            <Calculator className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-300">{activeQuotes}</div>
            <p className="text-xs text-slate-500">Awaiting lock decision</p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Locked Rates
            </CardTitle>
            <Lock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{lockedQuotes}</div>
            <p className="text-xs text-slate-500">Rate locks in effect</p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Avg Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-400">{avgRate.toFixed(3)}%</div>
            <p className="text-xs text-slate-500">Across all products</p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Expiring Soon
            </CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">2</div>
            <p className="text-xs text-slate-500">Within 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Rates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>Current Rates</CardTitle>
              {connected && (
                <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-green-400/10 border border-green-400/20">
                  <div className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-xs text-green-300">Live Updates</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-400">
                Last updated: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
              </div>
              <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {displayRates.map((rate) => (
              <div
                key={rate.id || rate.product}
                className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:bg-slate-900/70 transition-colors group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-slate-200">{rate.product}</h3>
                  <div className="flex items-center gap-1">
                    <TrendIcon trend={rate.trend} />
                    <span className={`text-xs font-medium ${getTrendColor(rate.trend)}`}>
                      {typeof rate.change === 'number'
                        ? `${rate.change > 0 ? '+' : ''}${rate.change.toFixed(3)}%`
                        : rate.change}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-slate-100">
                    {rate.rate.toFixed(3)}%
                  </div>
                  <div className="text-sm text-slate-400">
                    APR: {rate.apr.toFixed(3)}% • {rate.points} points
                  </div>
                  {(rate as any).lender && (
                    <div className="text-xs text-slate-500">
                      via {(rate as any).lender}
                    </div>
                  )}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                    <Button variant="ghost" size="sm" className="w-full text-xs">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Rate Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quote Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle>Quote Management</CardTitle>
              <div className="text-sm text-slate-400">
                {filteredQuotes.length} of {recentQuotes.length} quotes
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search quotes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9 w-64 pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-12">
              <Calculator className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-2">No quotes found</p>
              <p className="text-slate-500 text-sm">
                {searchTerm ? 'Try adjusting your search terms' : 'Generate your first quote to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="data-table-row rounded-lg border border-slate-800 p-4 hover:bg-slate-900/30 transition-colors"
                >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-400 text-white font-medium text-sm">
                      {quote.borrower.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-slate-100">{quote.borrower}</p>
                      <p className="text-sm text-slate-400">{quote.product}</p>
                    </div>
                  </div>

                  <div className="hidden lg:flex items-center gap-8 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-slate-200">{formatCurrency(quote.loanAmount)}</div>
                      <div className="text-slate-400">Loan Amount</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-slate-200">{quote.rate.toFixed(3)}%</div>
                      <div className="text-slate-400">Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-slate-200">{formatCurrency(quote.monthlyPayment)}</div>
                      <div className="text-slate-400">P&I Payment</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-slate-200">{formatDate(quote.lockExpires)}</div>
                      <div className="text-slate-400">Lock Expires</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(quote.status)}`}>
                      {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>

                {/* Mobile Details */}
                <div className="lg:hidden mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Loan Amount:</span>
                    <span className="ml-2 text-slate-200">{formatCurrency(quote.loanAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Rate:</span>
                    <span className="ml-2 text-slate-200">{quote.rate.toFixed(3)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Payment:</span>
                    <span className="ml-2 text-slate-200">{formatCurrency(quote.monthlyPayment)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Expires:</span>
                    <span className="ml-2 text-slate-200">{formatDate(quote.lockExpires)}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(quote.status)}`}>
                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                      </div>
                      {hasPermission('quotes:edit') && (
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </div>

                  {/* Mobile Details */}
                  <div className="lg:hidden mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Loan Amount:</span>
                      <span className="ml-2 text-slate-200">{formatCurrency(quote.loanAmount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Rate:</span>
                      <span className="ml-2 text-slate-200">{quote.rate.toFixed(3)}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Payment:</span>
                      <span className="ml-2 text-slate-200">{formatCurrency(quote.monthlyPayment)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Expires:</span>
                      <span className="ml-2 text-slate-200">{formatDate(quote.lockExpires)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote Generator Modal/Form */}
      {showQuoteForm && (
        <QuoteGeneratorForm
          rates={displayRates}
          onClose={() => setShowQuoteForm(false)}
          onQuoteGenerated={(quote) => {
            // Handle new quote
            console.log('New quote generated:', quote)
            setShowQuoteForm(false)
          }}
        />
      )}
    </div>
  )
}

// Quote Generator Form Component
function QuoteGeneratorForm({
  rates,
  onClose,
  onQuoteGenerated
}: {
  rates: any[]
  onClose: () => void
  onQuoteGenerated: (quote: any) => void
}) {
  const [formData, setFormData] = useState({
    borrowerName: '',
    email: '',
    phone: '',
    loanAmount: '',
    downPayment: '',
    creditScore: '',
    product: '',
    propertyType: 'single-family',
    occupancy: 'primary',
    purchaseType: 'purchase'
  })

  const [calculatedQuote, setCalculatedQuote] = useState<any>(null)

  const handleCalculate = () => {
    const selectedRate = rates.find(r => r.product === formData.product)
    if (!selectedRate || !formData.loanAmount) return

    const loanAmount = parseFloat(formData.loanAmount)
    const monthlyRate = selectedRate.rate / 100 / 12
    const numberOfPayments = 30 * 12 // Assuming 30-year term

    const monthlyPayment =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

    setCalculatedQuote({
      id: `quote-${Date.now()}`,
      borrower: formData.borrowerName,
      email: formData.email,
      phone: formData.phone,
      loanAmount,
      product: formData.product,
      rate: selectedRate.rate,
      apr: selectedRate.apr,
      monthlyPayment: Math.round(monthlyPayment),
      status: 'active',
      lockExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Generate New Quote</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details" className="w-full">
            <TabsList>
              <TabsTrigger value="details">Borrower Details</TabsTrigger>
              <TabsTrigger value="loan">Loan Information</TabsTrigger>
              <TabsTrigger value="quote">Quote Results</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="borrowerName">Borrower Name *</Label>
                  <Input
                    id="borrowerName"
                    value={formData.borrowerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, borrowerName: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="borrower@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditScore">Credit Score</Label>
                  <Select
                    value={formData.creditScore}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, creditScore: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="800+">800+ (Excellent)</SelectItem>
                      <SelectItem value="740-799">740-799 (Very Good)</SelectItem>
                      <SelectItem value="670-739">670-739 (Good)</SelectItem>
                      <SelectItem value="580-669">580-669 (Fair)</SelectItem>
                      <SelectItem value="<580">&lt;580 (Poor)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="loan" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount *</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    value={formData.loanAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, loanAmount: e.target.value }))}
                    placeholder="450000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="downPayment">Down Payment</Label>
                  <Input
                    id="downPayment"
                    value={formData.downPayment}
                    onChange={(e) => setFormData(prev => ({ ...prev, downPayment: e.target.value }))}
                    placeholder="90000 or 20%"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product">Loan Product *</Label>
                  <Select
                    value={formData.product}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, product: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {rates.map(rate => (
                        <SelectItem key={rate.id || rate.product} value={rate.product}>
                          {rate.product} - {rate.rate.toFixed(3)}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single-family">Single Family</SelectItem>
                      <SelectItem value="condo">Condominium</SelectItem>
                      <SelectItem value="townhome">Townhome</SelectItem>
                      <SelectItem value="multi-family">Multi-Family</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleCalculate}
                  disabled={!formData.borrowerName || !formData.email || !formData.loanAmount || !formData.product}
                  className="btn-primary"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Quote
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="quote">
              {calculatedQuote ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card variant="glass">
                      <CardContent className="p-4 text-center">
                        <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-slate-100">
                          {formatCurrency(calculatedQuote.monthlyPayment)}
                        </p>
                        <p className="text-sm text-slate-400">Monthly Payment</p>
                      </CardContent>
                    </Card>
                    <Card variant="glass">
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-slate-100">
                          {calculatedQuote.rate.toFixed(3)}%
                        </p>
                        <p className="text-sm text-slate-400">Interest Rate</p>
                      </CardContent>
                    </Card>
                    <Card variant="glass">
                      <CardContent className="p-4 text-center">
                        <Clock className="h-8 w-8 text-violet-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-slate-100">
                          {formatDate(calculatedQuote.lockExpires)}
                        </p>
                        <p className="text-sm text-slate-400">Lock Expires</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex justify-center gap-3">
                    <Button variant="secondary" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      className="btn-primary"
                      onClick={() => onQuoteGenerated(calculatedQuote)}
                    >
                      Generate Quote
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calculator className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">Complete the form and calculate to see quote results</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
