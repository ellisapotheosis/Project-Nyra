import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Search,
  Filter,
  Download,
  Plus,
  Phone,
  Mail,
  Star,
  MapPin,
  DollarSign,
  Calendar
} from 'lucide-react'

// Mock lead data - In production, this would come from TwentyCRM API
const mockLeads = [
  {
    id: 'lead-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    source: 'ratehunter',
    status: 'new',
    loanAmount: 450000,
    creditScore: '740-799',
    leadScore: 85,
    leadGrade: 'A' as const,
    location: 'San Francisco, CA',
    createdAt: '2026-03-10T14:30:00Z',
    lastContact: null,
    assignedTo: null,
  },
  {
    id: 'lead-002',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '(555) 987-6543',
    source: 'referral',
    status: 'contacted',
    loanAmount: 325000,
    creditScore: '670-739',
    leadScore: 92,
    leadGrade: 'A' as const,
    location: 'Austin, TX',
    createdAt: '2026-03-10T09:15:00Z',
    lastContact: '2026-03-10T16:45:00Z',
    assignedTo: 'Ellis Andersen',
  },
  {
    id: 'lead-003',
    name: 'Lisa Rodriguez',
    email: 'lisa.rodriguez@email.com',
    phone: '(555) 555-0123',
    source: 'google_ads',
    status: 'qualified',
    loanAmount: 275000,
    creditScore: '800+',
    leadScore: 78,
    leadGrade: 'B' as const,
    location: 'Denver, CO',
    createdAt: '2026-03-09T11:22:00Z',
    lastContact: '2026-03-10T10:30:00Z',
    assignedTo: 'Ellis Andersen',
  },
  {
    id: 'lead-004',
    name: 'David Kim',
    email: 'david.kim@email.com',
    phone: '(555) 444-7890',
    source: 'direct_mail',
    status: 'application',
    loanAmount: 525000,
    creditScore: '740-799',
    leadScore: 88,
    leadGrade: 'A' as const,
    location: 'Seattle, WA',
    createdAt: '2026-03-08T16:45:00Z',
    lastContact: '2026-03-09T14:20:00Z',
    assignedTo: 'Ellis Andersen',
  },
]

function getStatusColor(status: string) {
  switch (status) {
    case 'new':
      return 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20'
    case 'contacted':
      return 'bg-blue-400/10 text-blue-300 border-blue-400/20'
    case 'qualified':
      return 'bg-green-400/10 text-green-300 border-green-400/20'
    case 'application':
      return 'bg-violet-400/10 text-violet-300 border-violet-400/20'
    case 'closed':
      return 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20'
    default:
      return 'bg-slate-400/10 text-slate-300 border-slate-400/20'
  }
}

function getGradeColor(grade: 'A' | 'B' | 'C' | 'D') {
  switch (grade) {
    case 'A':
      return 'bg-green-400/10 text-green-300 border-green-400/30'
    case 'B':
      return 'bg-blue-400/10 text-blue-300 border-blue-400/30'
    case 'C':
      return 'bg-yellow-400/10 text-yellow-300 border-yellow-400/30'
    case 'D':
      return 'bg-red-400/10 text-red-300 border-red-400/30'
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
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function LeadsPage() {
  const totalLeads = mockLeads.length
  const newLeads = mockLeads.filter(lead => lead.status === 'new').length
  const qualifiedLeads = mockLeads.filter(lead => lead.status === 'qualified').length
  const averageScore = Math.round(mockLeads.reduce((sum, lead) => sum + lead.leadScore, 0) / totalLeads)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Lead Management</h1>
          <p className="text-slate-400 mt-1">
            Manage and track mortgage leads from all sources
          </p>
        </div>
        <Button className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Total Leads
            </CardTitle>
            <Star className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100">{totalLeads}</div>
            <p className="text-xs text-slate-500">Active in pipeline</p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              New Leads
            </CardTitle>
            <Plus className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-300">{newLeads}</div>
            <p className="text-xs text-slate-500">Awaiting contact</p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Qualified
            </CardTitle>
            <Star className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{qualifiedLeads}</div>
            <p className="text-xs text-slate-500">Ready for application</p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Avg Score
            </CardTitle>
            <Star className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-400">{averageScore}</div>
            <p className="text-xs text-slate-500">Lead quality score</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leads Overview</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  className="h-9 w-64 rounded-lg border border-slate-700 bg-slate-800/50 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <Button variant="secondary" size="sm">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockLeads.map((lead) => (
              <div
                key={lead.id}
                className="data-table-row rounded-lg border border-slate-800 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Lead Info */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-400 text-white font-medium text-sm">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-slate-100">{lead.name}</p>
                        <p className="text-sm text-slate-400">{lead.email}</p>
                      </div>
                    </div>

                    {/* Lead Details */}
                    <div className="hidden lg:flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-300">{formatCurrency(lead.loanAmount)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-300">{lead.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-300">{formatDate(lead.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Lead Score & Grade */}
                    <div className="hidden md:flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-200">Score: {lead.leadScore}</div>
                        <div className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${getGradeColor(lead.leadGrade)}`}>
                          Grade {lead.leadGrade}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Mobile Details */}
                <div className="lg:hidden mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">{formatCurrency(lead.loanAmount)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">Score: {lead.leadScore} (Grade {lead.leadGrade})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">{lead.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">{formatDate(lead.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
