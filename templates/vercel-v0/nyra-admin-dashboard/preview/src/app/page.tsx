import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  Calculator,
  TrendingUp,
  DollarSign,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

// Mock data - In production, this would come from APIs
const dashboardMetrics = {
  leadsToday: { value: 12, change: '+8%', trend: 'up' as const },
  activeQuotes: { value: 847, change: '+12%', trend: 'up' as const },
  pipelineValue: { value: 24500000, change: '+5%', trend: 'up' as const },
  conversionRate: { value: 3.2, change: '-0.3%', trend: 'down' as const },
  avgProcessingTime: { value: 18, change: '-2 days', trend: 'up' as const },
  complianceScore: { value: 98.5, change: '+0.5%', trend: 'up' as const },
}

const recentActivity = [
  {
    id: 1,
    type: 'lead',
    title: 'New lead from RateHunter',
    description: 'Sarah Johnson - $450,000 purchase loan',
    time: '5 minutes ago',
    status: 'new'
  },
  {
    id: 2,
    type: 'quote',
    title: 'Quote generated',
    description: 'Michael Chen - 30Y Conventional at 6.875%',
    time: '12 minutes ago',
    status: 'completed'
  },
  {
    id: 3,
    type: 'application',
    title: 'Application submitted',
    description: 'Lisa Rodriguez - $325,000 FHA purchase',
    time: '18 minutes ago',
    status: 'processing'
  },
  {
    id: 4,
    type: 'compliance',
    title: 'Disclosure delivered',
    description: 'TILA-RESPA LE sent to David Kim',
    time: '32 minutes ago',
    status: 'completed'
  },
]

const systemAlerts = [
  {
    id: 1,
    type: 'warning',
    title: 'Rate lock expiring soon',
    description: '3 loans have rate locks expiring within 7 days',
    action: 'Review locks'
  },
  {
    id: 2,
    type: 'info',
    title: 'Campaign performance',
    description: 'Email campaign #47 has 35% open rate',
    action: 'View details'
  },
]

function MetricCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  format = 'number'
}: {
  title: string
  value: number
  change: string
  trend: 'up' | 'down'
  icon: React.ComponentType<{ className?: string }>
  format?: 'number' | 'currency' | 'percentage' | 'days'
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: 'compact',
          maximumFractionDigits: 1,
        }).format(val)
      case 'percentage':
        return `${val}%`
      case 'days':
        return `${val} days`
      default:
        return new Intl.NumberFormat('en-US').format(val)
    }
  }

  const trendColor = trend === 'up' ? 'text-emerald-400' : 'text-rose-400'
  const bgColor = trend === 'up' ? 'bg-emerald-400/10' : 'bg-rose-400/10'

  return (
    <Card className="metric-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-slate-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-100">
          {formatValue(value)}
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className={`text-xs font-medium ${trendColor}`}>
            {change}
          </span>
          <span className="text-xs text-slate-500">from last month</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">
            Welcome back, Ellis
          </h1>
          <p className="text-slate-400 mt-1">
            Here's what's happening with your mortgage operations today.
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">Today</div>
          <div className="text-lg font-medium text-slate-200">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          title="Today's Leads"
          value={dashboardMetrics.leadsToday.value}
          change={dashboardMetrics.leadsToday.change}
          trend={dashboardMetrics.leadsToday.trend}
          icon={Users}
        />
        <MetricCard
          title="Active Quotes"
          value={dashboardMetrics.activeQuotes.value}
          change={dashboardMetrics.activeQuotes.change}
          trend={dashboardMetrics.activeQuotes.trend}
          icon={Calculator}
        />
        <MetricCard
          title="Pipeline Value"
          value={dashboardMetrics.pipelineValue.value}
          change={dashboardMetrics.pipelineValue.change}
          trend={dashboardMetrics.pipelineValue.trend}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Conversion Rate"
          value={dashboardMetrics.conversionRate.value}
          change={dashboardMetrics.conversionRate.change}
          trend={dashboardMetrics.conversionRate.trend}
          icon={TrendingUp}
          format="percentage"
        />
        <MetricCard
          title="Avg Processing Time"
          value={dashboardMetrics.avgProcessingTime.value}
          change={dashboardMetrics.avgProcessingTime.change}
          trend={dashboardMetrics.avgProcessingTime.trend}
          icon={Clock}
          format="days"
        />
        <MetricCard
          title="Compliance Score"
          value={dashboardMetrics.complianceScore.value}
          change={dashboardMetrics.complianceScore.change}
          trend={dashboardMetrics.complianceScore.trend}
          icon={Award}
          format="percentage"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                  <div className="flex-shrink-0 mt-0.5">
                    {activity.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    ) : activity.status === 'processing' ? (
                      <Clock className="h-4 w-4 text-yellow-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-cyan-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">
                      {activity.title}
                    </p>
                    <p className="text-sm text-slate-400">
                      {activity.description}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts & Quick Actions */}
        <div className="space-y-6">
          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border border-yellow-400/20 bg-yellow-400/5">
                    <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-200">
                        {alert.title}
                      </p>
                      <p className="text-sm text-slate-400">
                        {alert.description}
                      </p>
                    </div>
                    <button className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
                      {alert.action}
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center gap-2 p-3 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 transition-colors text-left">
                  <Users className="h-4 w-4 text-cyan-400" />
                  <div>
                    <div className="text-sm font-medium text-slate-200">View Leads</div>
                    <div className="text-xs text-slate-400">Manage pipeline</div>
                  </div>
                </button>
                <button className="flex items-center gap-2 p-3 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 transition-colors text-left">
                  <Calculator className="h-4 w-4 text-violet-400" />
                  <div>
                    <div className="text-sm font-medium text-slate-200">Quote Desk</div>
                    <div className="text-xs text-slate-400">Generate quotes</div>
                  </div>
                </button>
                <button className="flex items-center gap-2 p-3 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 transition-colors text-left">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <div>
                    <div className="text-sm font-medium text-slate-200">Campaigns</div>
                    <div className="text-xs text-slate-400">Marketing tools</div>
                  </div>
                </button>
                <button className="flex items-center gap-2 p-3 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 transition-colors text-left">
                  <Award className="h-4 w-4 text-yellow-400" />
                  <div>
                    <div className="text-sm font-medium text-slate-200">Compliance</div>
                    <div className="text-xs text-slate-400">Audit & reports</div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
