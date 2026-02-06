/**
 * Dashboard Hooks
 * React hooks for dashboard functionality
 */

export { default as useWebSocket, type UseWebSocketConfig, type UseWebSocketOptions, type UseWebSocketReturn } from './useWebSocket';
export { useTopology } from './useTopology';

// Re-export hook types
export type { UseTopologyReturn } from '../types';
