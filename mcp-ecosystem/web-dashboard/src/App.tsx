import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  Activity, 
  Server, 
  Shield, 
  Database, 
  Terminal, 
  Settings,
  Bell,
  Search,
  Menu,
  X,
  PlayCircle,
  StopCircle,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Key,
  Github,
  FileText,
  Container,
  Zap
} from 'lucide-react';
import './App.css';

// Types
interface MCPServer {
  id: string;
  name: string;
  type: 'filesystem' | 'github' | 'docker' | 'infisical' | 'bitwarden' | 'metamcp';
  status: 'running' | 'stopped' | 'error' | 'starting';
  port?: number;
  endpoint?: string;
  uptime?: number;
  lastActivity?: Date;
  metrics?: {
    requests: number;
    errors: number;
    responseTime: number;
  };
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    incoming: number;
    outgoing: number;
  };
}

const XulbuXColors = {
  primary: '#7572F7',
  accent: '#B38CFF',
  success: '#96FFBE',
  info: '#9CF6FF',
  warning: '#FFE066',
  error: '#FF5DAE',
  background: '#0A0A0F',
  surface: '#1A1A2E'
};

// Mock data - replace with actual API calls
const mockServers: MCPServer[] = [
  {
    id: 'filesystem',
    name: 'FileSystem MCP',
    type: 'filesystem',
    status: 'running',
    port: 8000,
    endpoint: 'http://localhost:8000',
    uptime: 86400,
    lastActivity: new Date(),
    metrics: { requests: 1234, errors: 2, responseTime: 45 }
  },
  {
    id: 'github',
    name: 'GitHub MCP',
    type: 'github',
    status: 'running',
    port: 8001,
    endpoint: 'http://localhost:8001',
    uptime: 72000,
    lastActivity: new Date(),
    metrics: { requests: 856, errors: 0, responseTime: 120 }
  },
  {
    id: 'docker',
    name: 'Docker MCP',
    type: 'docker',
    status: 'stopped',
    port: 8002,
    endpoint: 'http://localhost:8002',
    uptime: 0,
    metrics: { requests: 0, errors: 0, responseTime: 0 }
  },
  {
    id: 'infisical',
    name: 'Infisical MCP',
    type: 'infisical',
    status: 'running',
    port: 3001,
    endpoint: 'http://localhost:3001',
    uptime: 95400,
    lastActivity: new Date(),
    metrics: { requests: 2341, errors: 5, responseTime: 78 }
  },
  {
    id: 'bitwarden',
    name: 'Bitwarden MCP',
    type: 'bitwarden',
    status: 'error',
    metrics: { requests: 45, errors: 12, responseTime: 0 }
  },
  {
    id: 'metamcp',
    name: 'MetaMCP Orchestrator',
    type: 'metamcp',
    status: 'running',
    port: 12008,
    endpoint: 'http://localhost:12008',
    uptime: 134400,
    lastActivity: new Date(),
    metrics: { requests: 5678, errors: 3, responseTime: 32 }
  }
];

// Components
const ServerIcon = ({ type }: { type: string }) => {
  const icons = {
    filesystem: FileText,
    github: Github,
    docker: Container,
    infisical: Key,
    bitwarden: Shield,
    metamcp: Zap
  };
  const IconComponent = icons[type as keyof typeof icons] || Server;
  return <IconComponent size={20} />;
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors = {
    running: XulbuXColors.success,
    stopped: '#666',
    error: XulbuXColors.error,
    starting: XulbuXColors.warning
  };
  
  return (
    <span 
      className="px-2 py-1 rounded-full text-xs font-medium"
      style={{ 
        backgroundColor: `${colors[status as keyof typeof colors]}20`,
        color: colors[status as keyof typeof colors]
      }}
    >
      {status.toUpperCase()}
    </span>
  );
};

const ServerCard = ({ server, onAction }: { server: MCPServer; onAction: (id: string, action: string) => void }) => {
  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="server-card" style={{ backgroundColor: XulbuXColors.surface }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${XulbuXColors.accent}20` }}>
            <ServerIcon type={server.type} />
          </div>
          <div>
            <h3 className="font-semibold text-white">{server.name}</h3>
            <p className="text-sm text-gray-400">
              {server.endpoint || 'No endpoint'}
            </p>
          </div>
        </div>
        <StatusBadge status={server.status} />
      </div>

      {server.metrics && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{server.metrics.requests}</div>
            <div className="text-xs text-gray-400">Requests</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: server.metrics.errors > 0 ? XulbuXColors.error : XulbuXColors.success }}>
              {server.metrics.errors}
            </div>
            <div className="text-xs text-gray-400">Errors</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{server.metrics.responseTime}ms</div>
            <div className="text-xs text-gray-400">Response</div>
          </div>
        </div>
      )}

      {server.uptime && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Clock size={14} />
            <span>Uptime: {formatUptime(server.uptime)}</span>
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        {server.status === 'running' ? (
          <button 
            className="flex-1 py-2 px-3 rounded-lg text-white text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ backgroundColor: XulbuXColors.error }}
            onClick={() => onAction(server.id, 'stop')}
          >
            <StopCircle size={16} className="inline mr-1" />
            Stop
          </button>
        ) : (
          <button 
            className="flex-1 py-2 px-3 rounded-lg text-white text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ backgroundColor: XulbuXColors.success }}
            onClick={() => onAction(server.id, 'start')}
          >
            <PlayCircle size={16} className="inline mr-1" />
            Start
          </button>
        )}
        <button 
          className="py-2 px-3 rounded-lg text-white text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ backgroundColor: XulbuXColors.accent }}
          onClick={() => onAction(server.id, 'restart')}
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
};

const SystemOverview = ({ metrics }: { metrics: SystemMetrics }) => {
  const ProgressBar = ({ value, color }: { value: number; color: string }) => (
    <div className="w-full bg-gray-700 rounded-full h-2">
      <div 
        className="h-2 rounded-full transition-all duration-300"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="metric-card" style={{ backgroundColor: XulbuXColors.surface }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-300">CPU Usage</h3>
          <span className="text-lg font-bold text-white">{metrics.cpu}%</span>
        </div>
        <ProgressBar value={metrics.cpu} color={XulbuXColors.primary} />
      </div>

      <div className="metric-card" style={{ backgroundColor: XulbuXColors.surface }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-300">Memory</h3>
          <span className="text-lg font-bold text-white">{metrics.memory}%</span>
        </div>
        <ProgressBar value={metrics.memory} color={XulbuXColors.accent} />
      </div>

      <div className="metric-card" style={{ backgroundColor: XulbuXColors.surface }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-300">Disk Usage</h3>
          <span className="text-lg font-bold text-white">{metrics.disk}%</span>
        </div>
        <ProgressBar value={metrics.disk} color={XulbuXColors.info} />
      </div>

      <div className="metric-card" style={{ backgroundColor: XulbuXColors.surface }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-300">Network</h3>
          <div className="text-right">
            <div className="text-sm text-white">↑ {metrics.network.outgoing} MB/s</div>
            <div className="text-sm text-white">↓ {metrics.network.incoming} MB/s</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [servers, setServers] = useState<MCPServer[]>(mockServers);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 23,
    memory: 67,
    disk: 45,
    network: { incoming: 2.3, outgoing: 1.8 }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 5)),
        network: {
          incoming: Math.max(0, prev.network.incoming + (Math.random() - 0.5) * 2),
          outgoing: Math.max(0, prev.network.outgoing + (Math.random() - 0.5) * 2)
        }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleServerAction = async (serverId: string, action: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setServers(prev => prev.map(server => {
        if (server.id === serverId) {
          switch (action) {
            case 'start':
              return { ...server, status: 'starting' as const };
            case 'stop':
              return { ...server, status: 'stopped' as const, uptime: 0 };
            case 'restart':
              return { ...server, status: 'starting' as const };
            default:
              return server;
          }
        }
        return server;
      }));
      
      // Simulate status change after delay
      if (action === 'start' || action === 'restart') {
        setTimeout(() => {
          setServers(prev => prev.map(server => 
            server.id === serverId 
              ? { ...server, status: 'running' as const, uptime: 1 }
              : server
          ));
        }, 2000);
      }
      
      setIsLoading(false);
    }, 500);
  };

  const filteredServers = servers.filter(server =>
    server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    server.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const runningServers = servers.filter(s => s.status === 'running').length;
  const errorServers = servers.filter(s => s.status === 'error').length;

  return (
    <div className="dashboard" style={{ backgroundColor: XulbuXColors.background }}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">NYRA MCP Dashboard</h1>
            <p className="text-gray-400">
              Managing {servers.length} MCP servers • {runningServers} running 
              {errorServers > 0 && <span className="ml-2" style={{ color: XulbuXColors.error }}>• {errorServers} errors</span>}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search servers..."
                className="pl-10 pr-4 py-2 rounded-lg border-0 text-white"
                style={{ backgroundColor: XulbuXColors.surface }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button className="p-2 rounded-lg text-white hover:opacity-80 transition-opacity" style={{ backgroundColor: XulbuXColors.primary }}>
              <Bell size={20} />
            </button>
          </div>
        </div>

        {/* System Overview */}
        <SystemOverview metrics={systemMetrics} />

        {/* Quick Actions */}
        <div className="flex space-x-4 mb-8">
          <button 
            className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-80 transition-opacity"
            style={{ backgroundColor: XulbuXColors.success }}
            onClick={() => {
              servers.filter(s => s.status === 'stopped').forEach(s => 
                handleServerAction(s.id, 'start')
              );
            }}
          >
            <PlayCircle size={16} className="inline mr-2" />
            Start All
          </button>
          
          <button 
            className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-80 transition-opacity"
            style={{ backgroundColor: XulbuXColors.error }}
            onClick={() => {
              servers.filter(s => s.status === 'running').forEach(s => 
                handleServerAction(s.id, 'stop')
              );
            }}
          >
            <StopCircle size={16} className="inline mr-2" />
            Stop All
          </button>
          
          <button 
            className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-80 transition-opacity"
            style={{ backgroundColor: XulbuXColors.accent }}
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={16} className="inline mr-2" />
            Refresh
          </button>
        </div>

        {/* Server Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServers.map(server => (
            <ServerCard 
              key={server.id} 
              server={server} 
              onAction={handleServerAction}
            />
          ))}
        </div>

        {filteredServers.length === 0 && (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">No servers found</h3>
            <p className="text-gray-500">Try adjusting your search terms</p>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="flex items-center space-x-3 bg-white rounded-lg px-6 py-4">
            <RefreshCw className="animate-spin" size={20} />
            <span>Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Settings page component
const Settings = () => {
  return (
    <div className="p-8" style={{ backgroundColor: XulbuXColors.background, minHeight: '100vh' }}>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-6 rounded-lg" style={{ backgroundColor: XulbuXColors.surface }}>
              <h2 className="text-xl font-semibold text-white mb-4">MCP Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    MetaMCP Endpoint
                  </label>
                  <input 
                    type="text" 
                    defaultValue="http://localhost:12008"
                    className="w-full px-3 py-2 rounded-lg border-0 text-white"
                    style={{ backgroundColor: XulbuXColors.background }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    API Key
                  </label>
                  <input 
                    type="password" 
                    defaultValue="sk_mt_nyra_dev_2025"
                    className="w-full px-3 py-2 rounded-lg border-0 text-white"
                    style={{ backgroundColor: XulbuXColors.background }}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg" style={{ backgroundColor: XulbuXColors.surface }}>
              <h2 className="text-xl font-semibold text-white mb-4">Monitoring</h2>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-gray-300">Real-time metrics</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-gray-300">Error notifications</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-300">Performance alerts</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-lg" style={{ backgroundColor: XulbuXColors.surface }}>
              <h2 className="text-xl font-semibold text-white mb-4">Appearance</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Theme
                  </label>
                  <select 
                    className="w-full px-3 py-2 rounded-lg border-0 text-white"
                    style={{ backgroundColor: XulbuXColors.background }}
                  >
                    <option>XulbuX Purple (Default)</option>
                    <option>Dark Mode</option>
                    <option>High Contrast</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Refresh Interval (seconds)
                  </label>
                  <input 
                    type="number" 
                    defaultValue="3"
                    min="1"
                    max="60"
                    className="w-full px-3 py-2 rounded-lg border-0 text-white"
                    style={{ backgroundColor: XulbuXColors.background }}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg" style={{ backgroundColor: XulbuXColors.surface }}>
              <h2 className="text-xl font-semibold text-white mb-4">Security</h2>
              <div className="space-y-4">
                <button 
                  className="w-full py-2 px-4 rounded-lg text-white font-medium hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: XulbuXColors.primary }}
                >
                  Rotate API Keys
                </button>
                <button 
                  className="w-full py-2 px-4 rounded-lg text-white font-medium hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: XulbuXColors.accent }}
                >
                  Download Logs
                </button>
                <button 
                  className="w-full py-2 px-4 rounded-lg text-white font-medium hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: XulbuXColors.error }}
                >
                  Reset Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App component
const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen" style={{ backgroundColor: XulbuXColors.background }}>
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
          <div className="h-full px-6 py-8" style={{ backgroundColor: XulbuXColors.surface }}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white">NYRA MCP</h2>
              <button 
                className="lg:hidden text-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <nav className="space-y-2">
              <Link to="/" className="nav-link">
                <Activity size={20} />
                <span>Dashboard</span>
              </Link>
              <Link to="/servers" className="nav-link">
                <Server size={20} />
                <span>Servers</span>
              </Link>
              <Link to="/secrets" className="nav-link">
                <Shield size={20} />
                <span>Secrets</span>
              </Link>
              <Link to="/logs" className="nav-link">
                <Terminal size={20} />
                <span>Logs</span>
              </Link>
              <Link to="/settings" className="nav-link">
                <Settings size={20} />
                <span>Settings</span>
              </Link>
            </nav>

            <div className="mt-12 p-4 rounded-lg" style={{ backgroundColor: XulbuXColors.background }}>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: XulbuXColors.success }}></div>
                <span className="text-sm text-white font-medium">System Healthy</span>
              </div>
              <div className="text-xs text-gray-400">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          <button 
            className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg text-white"
            style={{ backgroundColor: XulbuXColors.primary }}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/servers" element={<Dashboard />} />
            <Route path="/secrets" element={<div className="p-8 text-white">Secrets Management - Coming Soon</div>} />
            <Route path="/logs" element={<div className="p-8 text-white">Log Viewer - Coming Soon</div>} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </Router>
  );
};

export default App;