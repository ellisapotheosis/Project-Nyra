/**
 * React Dashboard Example
 *
 * This example demonstrates:
 * - Using React hooks
 * - Real-time dashboard updates
 * - Multiple channel subscriptions
 * - Component composition
 */

import React, { useEffect, useState } from 'react';
import { useWebSocket, useMCPStatus, useGPUMetrics } from '@project-nyra/websocket-client/react';

// Status indicator component
function StatusIndicator({ connected }: { connected: boolean }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}>
      <div style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: connected ? '#10b981' : '#ef4444',
      }} />
      <span>{connected ? 'Connected' : 'Disconnected'}</span>
    </div>
  );
}

// MCP Server Card
function MCPServerCard({ server }: { server: any }) {
  const statusColor = {
    online: '#10b981',
    offline: '#ef4444',
    degraded: '#f59e0b',
  }[server.status];

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: 'white',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h3 style={{ margin: 0 }}>{server.name}</h3>
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          backgroundColor: statusColor,
          color: 'white',
        }}>
          {server.status}
        </span>
      </div>
      <div style={{ color: '#6b7280', fontSize: '14px' }}>
        <div>Tools: {server.toolCount}</div>
        {server.latency && <div>Latency: {server.latency}ms</div>}
        <div>Last Update: {new Date(server.lastUpdate).toLocaleTimeString()}</div>
      </div>
    </div>
  );
}

// GPU Metrics Card
function GPUMetricsCard({ worker }: { worker: any }) {
  const utilization = worker.gpuUtilization;
  const memoryPercent = (worker.memoryUsed / worker.memoryTotal) * 100;

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: 'white',
    }}>
      <h3 style={{ margin: '0 0 12px 0' }}>{worker.workerId}</h3>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>GPU Utilization</span>
          <span>{utilization.toFixed(1)}%</span>
        </div>
        <div style={{
          height: '8px',
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${utilization}%`,
            backgroundColor: utilization > 80 ? '#ef4444' : '#10b981',
          }} />
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Memory</span>
          <span>{(worker.memoryUsed / 1024).toFixed(1)}GB / {(worker.memoryTotal / 1024).toFixed(1)}GB</span>
        </div>
        <div style={{
          height: '8px',
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${memoryPercent}%`,
            backgroundColor: memoryPercent > 80 ? '#ef4444' : '#3b82f6',
          }} />
        </div>
      </div>

      <div style={{ color: '#6b7280', fontSize: '14px' }}>
        <div>Temperature: {worker.temperature}°C</div>
        <div>Power: {worker.powerUsage}W</div>
        <div>Active Models: {worker.activeModels.join(', ')}</div>
      </div>
    </div>
  );
}

// MCP Status Panel
function MCPStatusPanel() {
  const { connected, filteredEvents } = useMCPStatus('ws://localhost:8080', {
    token: process.env.REACT_APP_WS_TOKEN,
  });

  const latestStatus = filteredEvents[filteredEvents.length - 1];
  const servers = latestStatus?.data.servers || [];

  return (
    <div>
      <h2>MCP Server Status</h2>
      {!connected && <div>Connecting...</div>}
      {connected && servers.length === 0 && <div>No servers available</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {servers.map((server: any) => (
          <MCPServerCard key={server.serverId} server={server} />
        ))}
      </div>
    </div>
  );
}

// GPU Metrics Panel
function GPUMetricsPanel() {
  const { connected, filteredEvents } = useGPUMetrics('ws://localhost:8080', {
    token: process.env.REACT_APP_WS_TOKEN,
  });

  const latestMetrics = filteredEvents[filteredEvents.length - 1];
  const workers = latestMetrics?.data.workers || [];

  return (
    <div>
      <h2>GPU Metrics</h2>
      {!connected && <div>Connecting...</div>}
      {connected && workers.length === 0 && <div>No GPU workers available</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {workers.map((worker: any) => (
          <GPUMetricsCard key={worker.workerId} worker={worker} />
        ))}
      </div>
    </div>
  );
}

// Event Stream
function EventStream({ events }: { events: any[] }) {
  return (
    <div>
      <h2>Event Stream</h2>
      <div style={{
        maxHeight: '400px',
        overflowY: 'auto',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#f9fafb',
      }}>
        {events.map((event, i) => (
          <div key={i} style={{
            marginBottom: '8px',
            padding: '8px',
            backgroundColor: 'white',
            borderRadius: '4px',
            fontSize: '12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <strong>{event.type}</strong>
              <span style={{ color: '#6b7280' }}>
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div style={{ color: '#6b7280' }}>
              Source: {event.source}
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div style={{ textAlign: 'center', color: '#6b7280' }}>
            No events yet
          </div>
        )}
      </div>
    </div>
  );
}

// Main Dashboard
export function Dashboard() {
  const {
    connected,
    connecting,
    sessionId,
    events,
    error,
    clearEvents,
  } = useWebSocket('ws://localhost:8080', {
    token: process.env.REACT_APP_WS_TOKEN,
    autoConnect: true,
    debug: true,
  });

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Error</h1>
        <p style={{ color: '#ef4444' }}>{error.message}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e5e7eb',
      }}>
        <h1 style={{ margin: 0 }}>Project Nyra Dashboard</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <StatusIndicator connected={connected} />
          {sessionId && (
            <span style={{ color: '#6b7280', fontSize: '12px' }}>
              Session: {sessionId.substring(0, 8)}...
            </span>
          )}
        </div>
      </header>

      {connecting && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>Connecting to WebSocket server...</div>
        </div>
      )}

      {connected && (
        <div style={{ display: 'grid', gap: '32px' }}>
          <MCPStatusPanel />
          <GPUMetricsPanel />
          <EventStream events={events.slice(-20)} />
          <button
            onClick={clearEvents}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Clear Events
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
