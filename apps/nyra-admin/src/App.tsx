import { useState } from 'react';
import { LayoutDashboard, Users, Mail, Activity, Settings } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' },
    { icon: Users, label: 'Leads', view: 'leads' },
    { icon: Mail, label: 'Campaigns', view: 'campaigns' },
    { icon: Activity, label: 'System', view: 'system' },
  ];

  const stats = [
    { label: 'Total Leads', value: '1,234', change: '+12%', color: 'primary' },
    { label: 'Active Campaigns', value: '8', change: '+2', color: 'success' },
    { label: 'Quotes Generated', value: '456', change: '+8%', color: 'warning' },
    { label: 'System Health', value: '98%', change: 'Healthy', color: 'success' },
  ];

  const recentLeads = [
    { id: 1, name: 'John Smith', email: 'john@example.com', loanAmount: '$450,000', status: 'New' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', loanAmount: '$320,000', status: 'Quoted' },
    { id: 3, name: 'Mike Williams', email: 'mike@example.com', loanAmount: '$580,000', status: 'In Progress' },
  ];

  const activeCampaigns = [
    { id: 1, name: 'First-Time Buyers Q1', leads: 234, sent: 1200, openRate: '24%', status: 'Active' },
    { id: 2, name: 'Refinance Special', leads: 156, sent: 890, openRate: '31%', status: 'Active' },
    { id: 3, name: 'Jumbo Loan Outreach', leads: 89, sent: 450, openRate: '18%', status: 'Paused' },
  ];

  const systemHealth = [
    { name: 'Quote Engine', status: 'healthy', uptime: '99.9%', latency: '45ms' },
    { name: 'Campaign Engine', status: 'healthy', uptime: '99.8%', latency: '62ms' },
    { name: 'Orchestrator', status: 'healthy', uptime: '99.9%', latency: '38ms' },
    { name: 'Database', status: 'healthy', uptime: '100%', latency: '12ms' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-900 text-white flex flex-col">
        <div className="p-6 border-b border-primary-700">
          <h1 className="text-2xl font-bold">Nyra Admin</h1>
          <p className="text-sm text-primary-200 mt-1">Operations Dashboard</p>
        </div>

        <nav className="flex-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-primary-700">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-primary-200 hover:bg-primary-800 hover:text-white transition-colors">
            <Settings className="h-5 w-5" />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <h2 className="text-3xl font-bold text-gray-900">
            {navItems.find((item) => item.view === activeView)?.label || 'Dashboard'}
          </h2>
          <p className="text-gray-600 mt-1">Welcome back! Here's your overview.</p>
        </header>

        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-600 mb-1">{stat.label}</div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className={`text-sm font-medium ${
                  stat.color === 'success' ? 'text-success-700' :
                  stat.color === 'warning' ? 'text-warning-500' :
                  'text-primary-600'
                }`}>
                  {stat.change}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Leads */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Leads</h3>
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-600">{lead.email}</div>
                      <div className="text-sm font-medium text-primary-600">{lead.loanAmount}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        lead.status === 'New' ? 'bg-primary-100 text-primary-700' :
                        lead.status === 'Quoted' ? 'bg-success-100 text-success-700' :
                        'bg-warning-100 text-warning-700'
                      }`}>
                        {lead.status}
                      </span>
                      <button className="px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-700">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Campaigns */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Active Campaigns</h3>
              <div className="space-y-3">
                {activeCampaigns.map((campaign) => (
                  <div key={campaign.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">{campaign.name}</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'Active' ? 'bg-success-100 text-success-700' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-gray-600">Leads</div>
                        <div className="font-medium text-gray-900">{campaign.leads}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Sent</div>
                        <div className="font-medium text-gray-900">{campaign.sent}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Open Rate</div>
                        <div className="font-medium text-gray-900">{campaign.openRate}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">System Health</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {systemHealth.map((service) => (
                <div key={service.name} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{service.name}</div>
                    <span className="h-3 w-3 bg-success-500 rounded-full"></span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uptime</span>
                      <span className="font-medium text-gray-900">{service.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Latency</span>
                      <span className="font-medium text-gray-900">{service.latency}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
