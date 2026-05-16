'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  Container,
  Cpu,
  Database,
  FolderSync,
  Gauge,
  HardDrive,
  MemoryStick,
  Power,
  RefreshCcw,
  Server,
  Thermometer,
  Wifi,
  XCircle,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';

type TimeRange = '1h' | '6h' | '24h';
type NodeStatus = 'healthy' | 'warning' | 'degraded' | 'offline';
type ContainerStatus = 'running' | 'paused' | 'exited' | 'error';
type SyncHealth = 'synced' | 'syncing' | 'conflict' | 'error';

interface HardwareSpecs {
  gpuModel: string;
  vramCapacity: string;
  cpuCores: number;
  systemRam: string;
  storageCapacity: string;
}

interface RealtimeMetrics {
  gpuUtil: number;
  temperature: number;
  powerDraw: number;
  vramUsed: string;
  vramTotal: string;
}

interface HistoryPoint {
  label: string;
  gpuUtil: number;
  temperature: number;
  powerDraw: number;
}

interface ActiveProcess {
  id: string;
  modelName: string;
  memoryUsed: string;
  computePct: number;
  tempContribution: number;
  startedAt: string;
  estimatedCompletion: string | null;
  status: 'running' | 'queued' | 'draining';
}

interface ProcessDetail {
  id: string;
  modelName: string;
  framework: string;
  memoryUsed: string;
  computePct: number;
  tempContribution: number;
  startedAt: string;
  estimatedCompletion: string | null;
  status: 'running' | 'queued' | 'draining';
  inputTokens: number;
  outputTokens: number;
  tokensPerSec: number;
  contextLength: number;
  batchSize: number;
  requestSource: string;
  resourceBreakdown: { label: string; value: string; color: string }[];
}

interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: ContainerStatus;
  cpuPct: number;
  memUsed: string;
  uptime: string;
}

interface SyncthingStatus {
  health: SyncHealth;
  lastSyncTime: string;
  pendingItems: number;
  syncedBytes: string;
  totalBytes: string;
}

interface HealthWarning {
  id: string;
  type: 'temperature' | 'throttle' | 'sync' | 'power' | 'memory';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  detail: string;
  timestamp: string;
  resolved: boolean;
}

interface NodeData {
  id: string;
  displayName: string;
  status: NodeStatus;
  uptime: string;
  lastSync: string;
  hardware: HardwareSpecs;
  realtime: RealtimeMetrics;
  history: Record<TimeRange, HistoryPoint[]>;
  processes: ActiveProcess[];
  processDetails: Record<string, ProcessDetail>;
  containers: DockerContainer[];
  syncthing: SyncthingStatus;
  warnings: HealthWarning[];
}

const nodeDatabase: Record<string, NodeData> = {
  'worker-5090': {
    id: 'worker-5090',
    displayName: 'worker-5090',
    status: 'healthy',
    uptime: '14d 6h 22m',
    lastSync: '2m ago',
    hardware: {
      gpuModel: 'NVIDIA RTX 5090',
      vramCapacity: '48 GB GDDR7',
      cpuCores: 32,
      systemRam: '128 GB DDR5',
      storageCapacity: '4 TB NVMe',
    },
    realtime: {
      gpuUtil: 72,
      temperature: 66,
      powerDraw: 310,
      vramUsed: '18.6 GB',
      vramTotal: '48 GB',
    },
    history: {
      '1h': [
        { label: '0m',  gpuUtil: 58, temperature: 62, powerDraw: 275 },
        { label: '10m', gpuUtil: 71, temperature: 65, powerDraw: 304 },
        { label: '20m', gpuUtil: 80, temperature: 68, powerDraw: 325 },
        { label: '30m', gpuUtil: 74, temperature: 67, powerDraw: 312 },
        { label: '40m', gpuUtil: 69, temperature: 65, powerDraw: 298 },
        { label: '50m', gpuUtil: 72, temperature: 66, powerDraw: 310 },
      ],
      '6h': [
        { label: '1h', gpuUtil: 45, temperature: 58, powerDraw: 220 },
        { label: '2h', gpuUtil: 82, temperature: 69, powerDraw: 335 },
        { label: '3h', gpuUtil: 61, temperature: 63, powerDraw: 280 },
        { label: '4h', gpuUtil: 88, temperature: 72, powerDraw: 352 },
        { label: '5h', gpuUtil: 74, temperature: 66, powerDraw: 315 },
        { label: '6h', gpuUtil: 72, temperature: 66, powerDraw: 310 },
      ],
      '24h': [
        { label: '4h',  gpuUtil: 32, temperature: 54, powerDraw: 168 },
        { label: '8h',  gpuUtil: 91, temperature: 74, powerDraw: 368 },
        { label: '12h', gpuUtil: 76, temperature: 67, powerDraw: 320 },
        { label: '16h', gpuUtil: 55, temperature: 61, powerDraw: 258 },
        { label: '20h', gpuUtil: 84, temperature: 71, powerDraw: 342 },
        { label: '24h', gpuUtil: 72, temperature: 66, powerDraw: 310 },
      ],
    },
    processes: [
      { id: 'p1', modelName: 'DeepSeek-R1 236B', memoryUsed: '12.4 GB', computePct: 48, tempContribution: 28, startedAt: '2026-05-12 10:41', estimatedCompletion: null, status: 'running' },
      { id: 'p2', modelName: 'Qwen 2.5 72B', memoryUsed: '4.8 GB', computePct: 22, tempContribution: 14, startedAt: '2026-05-12 10:49', estimatedCompletion: '11:02 AM', status: 'running' },
      { id: 'p3', modelName: 'vLLM Router Shard', memoryUsed: '1.4 GB', computePct: 2, tempContribution: 3, startedAt: '2026-05-12 08:00', estimatedCompletion: null, status: 'running' },
    ],
    processDetails: {
      p1: {
        id: 'p1', modelName: 'DeepSeek-R1 236B', framework: 'vLLM 0.4.2', memoryUsed: '12.4 GB', computePct: 48, tempContribution: 28,
        startedAt: '2026-05-12 10:41', estimatedCompletion: null, status: 'running',
        inputTokens: 142_680, outputTokens: 28_440, tokensPerSec: 38.4, contextLength: 8192, batchSize: 4, requestSource: 'Nexus Router → Quote Generator Agent',
        resourceBreakdown: [
          { label: 'VRAM', value: '12.4 / 48 GB (25.8%)', color: 'from-purple-500 to-pink-400' },
          { label: 'Compute', value: '48% SM utilization', color: 'from-cyan-500 to-blue-500' },
          { label: 'Memory BW', value: '1,840 GB/s (73%)', color: 'from-pink-400 to-rose-500' },
          { label: 'PCIe BW', value: '14.2 GB/s', color: 'from-green-500 to-emerald-400' },
        ],
      },
      p2: {
        id: 'p2', modelName: 'Qwen 2.5 72B', framework: 'vLLM 0.4.2', memoryUsed: '4.8 GB', computePct: 22, tempContribution: 14,
        startedAt: '2026-05-12 10:49', estimatedCompletion: '11:02 AM', status: 'running',
        inputTokens: 22_400, outputTokens: 8_150, tokensPerSec: 64.2, contextLength: 4096, batchSize: 8, requestSource: 'Nexus Router → Dev/Code Agent',
        resourceBreakdown: [
          { label: 'VRAM', value: '4.8 / 48 GB (10.0%)', color: 'from-purple-500 to-pink-400' },
          { label: 'Compute', value: '22% SM utilization', color: 'from-cyan-500 to-blue-500' },
          { label: 'Memory BW', value: '840 GB/s (33%)', color: 'from-pink-400 to-rose-500' },
          { label: 'PCIe BW', value: '6.8 GB/s', color: 'from-green-500 to-emerald-400' },
        ],
      },
      p3: {
        id: 'p3', modelName: 'vLLM Router Shard', framework: 'vLLM 0.4.2', memoryUsed: '1.4 GB', computePct: 2, tempContribution: 3,
        startedAt: '2026-05-12 08:00', estimatedCompletion: null, status: 'running',
        inputTokens: 0, outputTokens: 0, tokensPerSec: 0, contextLength: 0, batchSize: 1, requestSource: 'Internal — model-router daemon',
        resourceBreakdown: [
          { label: 'VRAM', value: '1.4 / 48 GB (2.9%)', color: 'from-purple-500 to-pink-400' },
          { label: 'Compute', value: '2% SM utilization', color: 'from-cyan-500 to-blue-500' },
          { label: 'Memory BW', value: '120 GB/s (4.8%)', color: 'from-pink-400 to-rose-500' },
          { label: 'PCIe BW', value: '0.4 GB/s', color: 'from-green-500 to-emerald-400' },
        ],
      },
    },
    containers: [
      { id: 'c1', name: 'vllm-server',       image: 'vllm/vllm-openai:latest',    status: 'running', cpuPct: 14.2, memUsed: '1.8 GB', uptime: '14d 6h' },
      { id: 'c2', name: 'lmcache-proxy',     image: 'lmcache/lmcache:0.3.1',      status: 'running', cpuPct: 2.1,  memUsed: '480 MB', uptime: '14d 6h' },
      { id: 'c3', name: 'openclaw-worker',   image: 'nyra/openclaw:v2.1.4',        status: 'running', cpuPct: 4.8,  memUsed: '620 MB', uptime: '14d 5h' },
      { id: 'c4', name: 'node-exporter',     image: 'prom/node-exporter:v1.7.0',   status: 'running', cpuPct: 0.4,  memUsed: '32 MB',  uptime: '14d 6h' },
      { id: 'c5', name: 'syncthing',         image: 'syncthing/syncthing:1.27',    status: 'running', cpuPct: 0.8,  memUsed: '96 MB',  uptime: '14d 6h' },
      { id: 'c6', name: 'cadvisor',          image: 'gcr.io/cadvisor/cadvisor:v0.49.1', status: 'running', cpuPct: 1.2, memUsed: '128 MB', uptime: '14d 6h' },
    ],
    syncthing: {
      health: 'synced',
      lastSyncTime: '2m ago',
      pendingItems: 0,
      syncedBytes: '342 GB',
      totalBytes: '342 GB',
    },
    warnings: [
      { id: 'w1', type: 'temperature', severity: 'warning', message: 'GPU temp spike detected', detail: 'Temperature reached 74°C at 08:12 AM during DeepSeek-R1 burst load. Throttle threshold is 83°C. Current: 66°C.', timestamp: '2026-05-12 08:12', resolved: true },
    ],
  },
  'worker-3090ti': {
    id: 'worker-3090ti',
    displayName: 'worker-3090ti',
    status: 'warning',
    uptime: '9d 14h 08m',
    lastSync: '8m ago',
    hardware: {
      gpuModel: 'NVIDIA RTX 3090 Ti',
      vramCapacity: '24 GB GDDR6X',
      cpuCores: 16,
      systemRam: '64 GB DDR4',
      storageCapacity: '2 TB NVMe',
    },
    realtime: {
      gpuUtil: 48,
      temperature: 71,
      powerDraw: 245,
      vramUsed: '14.2 GB',
      vramTotal: '24 GB',
    },
    history: {
      '1h': [
        { label: '0m',  gpuUtil: 42, temperature: 68, powerDraw: 228 },
        { label: '10m', gpuUtil: 55, temperature: 71, powerDraw: 248 },
        { label: '20m', gpuUtil: 61, temperature: 73, powerDraw: 262 },
        { label: '30m', gpuUtil: 50, temperature: 70, powerDraw: 241 },
        { label: '40m', gpuUtil: 44, temperature: 69, powerDraw: 232 },
        { label: '50m', gpuUtil: 48, temperature: 71, powerDraw: 245 },
      ],
      '6h': [
        { label: '1h', gpuUtil: 28, temperature: 62, powerDraw: 180 },
        { label: '2h', gpuUtil: 64, temperature: 74, powerDraw: 272 },
        { label: '3h', gpuUtil: 58, temperature: 72, powerDraw: 254 },
        { label: '4h', gpuUtil: 72, temperature: 76, powerDraw: 292 },
        { label: '5h', gpuUtil: 55, temperature: 71, powerDraw: 248 },
        { label: '6h', gpuUtil: 48, temperature: 71, powerDraw: 245 },
      ],
      '24h': [
        { label: '4h',  gpuUtil: 18, temperature: 58, powerDraw: 142 },
        { label: '8h',  gpuUtil: 78, temperature: 77, powerDraw: 308 },
        { label: '12h', gpuUtil: 62, temperature: 73, powerDraw: 268 },
        { label: '16h', gpuUtil: 45, temperature: 69, powerDraw: 235 },
        { label: '20h', gpuUtil: 71, temperature: 75, powerDraw: 288 },
        { label: '24h', gpuUtil: 48, temperature: 71, powerDraw: 245 },
      ],
    },
    processes: [
      { id: 'p4', modelName: 'Llama 3.1 70B', memoryUsed: '8.4 GB', computePct: 32, tempContribution: 22, startedAt: '2026-05-12 09:55', estimatedCompletion: null, status: 'running' },
      { id: 'p5', modelName: 'Ops Classifier (Mistral 7B)', memoryUsed: '4.8 GB', computePct: 14, tempContribution: 11, startedAt: '2026-05-12 08:00', estimatedCompletion: null, status: 'running' },
      { id: 'p6', modelName: 'Campaign Parser Batch', memoryUsed: '1.0 GB', computePct: 2, tempContribution: 2, startedAt: '2026-05-12 10:44', estimatedCompletion: '10:55 AM', status: 'running' },
    ],
    processDetails: {
      p4: {
        id: 'p4', modelName: 'Llama 3.1 70B', framework: 'vLLM 0.4.1', memoryUsed: '8.4 GB', computePct: 32, tempContribution: 22,
        startedAt: '2026-05-12 09:55', estimatedCompletion: null, status: 'running',
        inputTokens: 88_200, outputTokens: 18_600, tokensPerSec: 42.1, contextLength: 4096, batchSize: 4, requestSource: 'Nexus Router → Lead Reply Parser',
        resourceBreakdown: [
          { label: 'VRAM', value: '8.4 / 24 GB (35.0%)', color: 'from-purple-500 to-pink-400' },
          { label: 'Compute', value: '32% SM utilization', color: 'from-cyan-500 to-blue-500' },
          { label: 'Memory BW', value: '980 GB/s (51%)', color: 'from-pink-400 to-rose-500' },
          { label: 'PCIe BW', value: '8.2 GB/s', color: 'from-green-500 to-emerald-400' },
        ],
      },
      p5: {
        id: 'p5', modelName: 'Ops Classifier (Mistral 7B)', framework: 'vLLM 0.4.1', memoryUsed: '4.8 GB', computePct: 14, tempContribution: 11,
        startedAt: '2026-05-12 08:00', estimatedCompletion: null, status: 'running',
        inputTokens: 420_000, outputTokens: 210_000, tokensPerSec: 88.4, contextLength: 2048, batchSize: 16, requestSource: 'Campaign Engine → STOP classifier',
        resourceBreakdown: [
          { label: 'VRAM', value: '4.8 / 24 GB (20.0%)', color: 'from-purple-500 to-pink-400' },
          { label: 'Compute', value: '14% SM utilization', color: 'from-cyan-500 to-blue-500' },
          { label: 'Memory BW', value: '440 GB/s (23%)', color: 'from-pink-400 to-rose-500' },
          { label: 'PCIe BW', value: '3.4 GB/s', color: 'from-green-500 to-emerald-400' },
        ],
      },
      p6: {
        id: 'p6', modelName: 'Campaign Parser Batch', framework: 'vLLM 0.4.1', memoryUsed: '1.0 GB', computePct: 2, tempContribution: 2,
        startedAt: '2026-05-12 10:44', estimatedCompletion: '10:55 AM', status: 'running',
        inputTokens: 4_200, outputTokens: 1_800, tokensPerSec: 112.0, contextLength: 512, batchSize: 32, requestSource: 'n8n workflow → campaign-parser-batch',
        resourceBreakdown: [
          { label: 'VRAM', value: '1.0 / 24 GB (4.2%)', color: 'from-purple-500 to-pink-400' },
          { label: 'Compute', value: '2% SM utilization', color: 'from-cyan-500 to-blue-500' },
          { label: 'Memory BW', value: '92 GB/s (4.8%)', color: 'from-pink-400 to-rose-500' },
          { label: 'PCIe BW', value: '0.8 GB/s', color: 'from-green-500 to-emerald-400' },
        ],
      },
    },
    containers: [
      { id: 'c7',  name: 'vllm-server',       image: 'vllm/vllm-openai:latest',    status: 'running', cpuPct: 8.4,  memUsed: '1.2 GB', uptime: '9d 14h' },
      { id: 'c8',  name: 'openclaw-worker',   image: 'nyra/openclaw:v2.1.4',        status: 'running', cpuPct: 3.2,  memUsed: '580 MB', uptime: '9d 13h' },
      { id: 'c9',  name: 'campaign-engine',   image: 'nyra/campaign-engine:v1.8.2', status: 'running', cpuPct: 6.1,  memUsed: '740 MB', uptime: '9d 14h' },
      { id: 'c10', name: 'node-exporter',     image: 'prom/node-exporter:v1.7.0',   status: 'running', cpuPct: 0.3,  memUsed: '28 MB',  uptime: '9d 14h' },
      { id: 'c11', name: 'syncthing',         image: 'syncthing/syncthing:1.27',    status: 'running', cpuPct: 1.1,  memUsed: '88 MB',  uptime: '9d 14h' },
      { id: 'c12', name: 'redis-cache',       image: 'redis:7.2-alpine',            status: 'running', cpuPct: 0.6,  memUsed: '124 MB', uptime: '9d 14h' },
    ],
    syncthing: {
      health: 'syncing',
      lastSyncTime: '8m ago',
      pendingItems: 14,
      syncedBytes: '188 GB',
      totalBytes: '194 GB',
    },
    warnings: [
      { id: 'w2', type: 'temperature', severity: 'warning', message: 'Sustained high temperature', detail: 'GPU has been above 70°C for 42 minutes. Consider reducing batch size. Throttle threshold: 83°C.', timestamp: '2026-05-12 10:10', resolved: false },
      { id: 'w3', type: 'sync', severity: 'info', message: 'Syncthing sync in progress', detail: '14 items pending sync to orchestrator. Started at 10:44 AM. ETA 3 minutes.', timestamp: '2026-05-12 10:44', resolved: false },
    ],
  },
  'worker-3060': {
    id: 'worker-3060',
    displayName: 'worker-3060',
    status: 'healthy',
    uptime: '22d 3h 45m',
    lastSync: '1m ago',
    hardware: {
      gpuModel: 'NVIDIA RTX 3060',
      vramCapacity: '12 GB GDDR6',
      cpuCores: 8,
      systemRam: '32 GB DDR4',
      storageCapacity: '1 TB NVMe',
    },
    realtime: {
      gpuUtil: 34,
      temperature: 58,
      powerDraw: 112,
      vramUsed: '3.8 GB',
      vramTotal: '12 GB',
    },
    history: {
      '1h': [
        { label: '0m',  gpuUtil: 28, temperature: 55, powerDraw: 98  },
        { label: '10m', gpuUtil: 38, temperature: 59, powerDraw: 118 },
        { label: '20m', gpuUtil: 42, temperature: 61, powerDraw: 124 },
        { label: '30m', gpuUtil: 31, temperature: 57, powerDraw: 106 },
        { label: '40m', gpuUtil: 29, temperature: 56, powerDraw: 100 },
        { label: '50m', gpuUtil: 34, temperature: 58, powerDraw: 112 },
      ],
      '6h': [
        { label: '1h', gpuUtil: 18, temperature: 52, powerDraw: 78  },
        { label: '2h', gpuUtil: 52, temperature: 64, powerDraw: 142 },
        { label: '3h', gpuUtil: 40, temperature: 61, powerDraw: 124 },
        { label: '4h', gpuUtil: 44, temperature: 62, powerDraw: 130 },
        { label: '5h', gpuUtil: 36, temperature: 59, powerDraw: 114 },
        { label: '6h', gpuUtil: 34, temperature: 58, powerDraw: 112 },
      ],
      '24h': [
        { label: '4h',  gpuUtil: 8,  temperature: 48, powerDraw: 58  },
        { label: '8h',  gpuUtil: 58, temperature: 65, powerDraw: 152 },
        { label: '12h', gpuUtil: 44, temperature: 62, powerDraw: 132 },
        { label: '16h', gpuUtil: 32, temperature: 57, powerDraw: 108 },
        { label: '20h', gpuUtil: 48, temperature: 63, powerDraw: 136 },
        { label: '24h', gpuUtil: 34, temperature: 58, powerDraw: 112 },
      ],
    },
    processes: [
      { id: 'p7', modelName: 'llama3.2:3b (Ollama)', memoryUsed: '2.8 GB', computePct: 28, tempContribution: 18, startedAt: '2026-05-12 10:38', estimatedCompletion: '10:56 AM', status: 'running' },
      { id: 'p8', modelName: 'CodeLlama 7B (Ollama)', memoryUsed: '1.0 GB', computePct: 6, tempContribution: 5, startedAt: '2026-05-12 08:00', estimatedCompletion: null, status: 'running' },
    ],
    processDetails: {
      p7: {
        id: 'p7', modelName: 'llama3.2:3b (Ollama)', framework: 'Ollama v0.3.6', memoryUsed: '2.8 GB', computePct: 28, tempContribution: 18,
        startedAt: '2026-05-12 10:38', estimatedCompletion: '10:56 AM', status: 'running',
        inputTokens: 12_400, outputTokens: 6_800, tokensPerSec: 74.2, contextLength: 2048, batchSize: 1, requestSource: 'LiteLLM fallback → Small Summary Agent',
        resourceBreakdown: [
          { label: 'VRAM', value: '2.8 / 12 GB (23.3%)', color: 'from-purple-500 to-pink-400' },
          { label: 'Compute', value: '28% SM utilization', color: 'from-cyan-500 to-blue-500' },
          { label: 'Memory BW', value: '180 GB/s (38%)', color: 'from-pink-400 to-rose-500' },
          { label: 'PCIe BW', value: '2.4 GB/s', color: 'from-green-500 to-emerald-400' },
        ],
      },
      p8: {
        id: 'p8', modelName: 'CodeLlama 7B (Ollama)', framework: 'Ollama v0.3.6', memoryUsed: '1.0 GB', computePct: 6, tempContribution: 5,
        startedAt: '2026-05-12 08:00', estimatedCompletion: null, status: 'running',
        inputTokens: 88_000, outputTokens: 42_000, tokensPerSec: 92.8, contextLength: 1024, batchSize: 1, requestSource: 'Tagging Agent → draft classification',
        resourceBreakdown: [
          { label: 'VRAM', value: '1.0 / 12 GB (8.3%)', color: 'from-purple-500 to-pink-400' },
          { label: 'Compute', value: '6% SM utilization', color: 'from-cyan-500 to-blue-500' },
          { label: 'Memory BW', value: '68 GB/s (14%)', color: 'from-pink-400 to-rose-500' },
          { label: 'PCIe BW', value: '0.6 GB/s', color: 'from-green-500 to-emerald-400' },
        ],
      },
    },
    containers: [
      { id: 'c13', name: 'ollama',           image: 'ollama/ollama:latest',         status: 'running', cpuPct: 4.2,  memUsed: '680 MB', uptime: '22d 3h' },
      { id: 'c14', name: 'openclaw-worker',  image: 'nyra/openclaw:v2.1.4',         status: 'running', cpuPct: 1.8,  memUsed: '420 MB', uptime: '22d 2h' },
      { id: 'c15', name: 'litellm-proxy',    image: 'ghcr.io/berriai/litellm:main', status: 'running', cpuPct: 0.9,  memUsed: '240 MB', uptime: '22d 3h' },
      { id: 'c16', name: 'node-exporter',    image: 'prom/node-exporter:v1.7.0',    status: 'running', cpuPct: 0.2,  memUsed: '24 MB',  uptime: '22d 3h' },
      { id: 'c17', name: 'syncthing',        image: 'syncthing/syncthing:1.27',     status: 'running', cpuPct: 0.5,  memUsed: '80 MB',  uptime: '22d 3h' },
    ],
    syncthing: {
      health: 'synced',
      lastSyncTime: '1m ago',
      pendingItems: 0,
      syncedBytes: '98 GB',
      totalBytes: '98 GB',
    },
    warnings: [],
  },
};

// ── helpers ──────────────────────────────────────────────────────────────────

function getNodeStatusConfig(status: NodeStatus) {
  switch (status) {
    case 'healthy':  return { label: 'Healthy',  color: 'bg-green-500/10 text-green-400 border-green-500/30',  dot: 'bg-green-400' };
    case 'warning':  return { label: 'Warning',  color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400 animate-pulse' };
    case 'degraded': return { label: 'Degraded', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30', dot: 'bg-orange-400 animate-pulse' };
    case 'offline':  return { label: 'Offline',  color: 'bg-red-500/10 text-red-400 border-red-500/30',    dot: 'bg-red-400' };
  }
}

function getTempColor(temp: number): string {
  if (temp >= 80) return 'text-red-400';
  if (temp >= 72) return 'text-orange-400';
  if (temp >= 65) return 'text-yellow-400';
  return 'text-green-400';
}

function getTempGradient(temp: number): string {
  if (temp >= 80) return 'from-red-500 to-orange-400';
  if (temp >= 72) return 'from-orange-500 to-yellow-400';
  if (temp >= 65) return 'from-yellow-500 to-amber-400';
  return 'from-green-500 to-cyan-400';
}

function getContainerStatusConfig(status: ContainerStatus) {
  switch (status) {
    case 'running': return { label: 'Running', color: 'bg-green-500/10 text-green-400 border-green-500/30' };
    case 'paused':  return { label: 'Paused',  color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' };
    case 'exited':  return { label: 'Exited',  color: 'bg-slate-500/10 text-slate-400 border-slate-500/30' };
    case 'error':   return { label: 'Error',   color: 'bg-red-500/10 text-red-400 border-red-500/30' };
  }
}

function getSyncConfig(health: SyncHealth) {
  switch (health) {
    case 'synced':    return { label: 'Synced',    color: 'text-green-400',  bgColor: 'bg-green-500/10 border-green-500/30' };
    case 'syncing':   return { label: 'Syncing…',  color: 'text-cyan-400',   bgColor: 'bg-cyan-500/10 border-cyan-500/30' };
    case 'conflict':  return { label: 'Conflict',  color: 'text-orange-400', bgColor: 'bg-orange-500/10 border-orange-500/30' };
    case 'error':     return { label: 'Error',     color: 'text-red-400',    bgColor: 'bg-red-500/10 border-red-500/30' };
  }
}

function getWarningSeverityConfig(severity: HealthWarning['severity']) {
  switch (severity) {
    case 'critical': return { color: 'text-red-400',    border: 'border-red-500/30',    bg: 'bg-red-500/5',    icon: <XCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" /> };
    case 'warning':  return { color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/5', icon: <AlertTriangle size={15} className="text-orange-400 flex-shrink-0 mt-0.5" /> };
    case 'info':     return { color: 'text-cyan-400',   border: 'border-cyan-500/30',   bg: 'bg-cyan-500/5',   icon: <Activity size={15} className="text-cyan-400 flex-shrink-0 mt-0.5" /> };
  }
}

function getWarningTypeIcon(type: HealthWarning['type']) {
  switch (type) {
    case 'temperature': return <Thermometer size={13} />;
    case 'throttle':    return <Zap size={13} />;
    case 'sync':        return <FolderSync size={13} />;
    case 'power':       return <Power size={13} />;
    case 'memory':      return <MemoryStick size={13} />;
  }
}

function getProcessStatusConfig(status: ActiveProcess['status']) {
  switch (status) {
    case 'running':  return { label: 'Running',  color: 'bg-green-500/10 text-green-400 border-green-500/30' };
    case 'queued':   return { label: 'Queued',   color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' };
    case 'draining': return { label: 'Draining', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30' };
  }
}

// ── mini bar chart ────────────────────────────────────────────────────────────

function MiniBarChart({
  data,
  valueKey,
  maxValue,
  gradientClass,
  label,
  unit,
}: {
  data: HistoryPoint[];
  valueKey: keyof HistoryPoint;
  maxValue: number;
  gradientClass: string;
  label: string;
  unit: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
        <BarChart3 size={12} /> {label}
      </p>
      <div className="flex items-end gap-1.5 h-24">
        {data.map((point, i) => {
          const val = point[valueKey] as number;
          const pct = (val / maxValue) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative w-full flex flex-col items-center justify-end h-20">
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition text-xs bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-white whitespace-nowrap z-10">
                  {val}{unit}
                </div>
                <div
                  className={`w-full rounded-t bg-gradient-to-t ${gradientClass} opacity-75 hover:opacity-100 transition-all`}
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-600">{point.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── main page ────────────────────────────────────────────────────────────────

export default function NodeDetailPage() {
  const params = useParams<{ nodeId: string }>();
  const nodeId = params?.nodeId ?? '';
  const node = nodeDatabase[nodeId];

  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [selectedProcess, setSelectedProcess] = useState<ProcessDetail | null>(null);

  if (!node) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Node Not Found"
          subtitle={`No node found with ID: ${nodeId}`}
        />
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-6">
            <p className="text-slate-400 text-sm">
              Available nodes: worker-5090, worker-3090ti, worker-3060
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusCfg = getNodeStatusConfig(node.status);
  const historyData = node.history[timeRange];
  const maxGpuUtil = 100;
  const maxTemp = Math.max(...historyData.map(p => p.temperature)) + 5;
  const maxPower = Math.max(...historyData.map(p => p.powerDraw)) + 20;
  const vramPct = (parseFloat(node.realtime.vramUsed) / parseFloat(node.realtime.vramTotal)) * 100;
  const activeWarnings = node.warnings.filter(w => !w.resolved);

  return (
    <div className="space-y-8">
      {/* ── Node Header ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <Server size={12} />
          <span>Fleet</span>
          <ChevronRight size={10} />
          <span className="text-slate-300">{node.displayName}</span>
        </div>
        <PageHeader
          title={node.displayName}
          subtitle={`${node.hardware.gpuModel} · ${node.hardware.vramCapacity}`}
        />
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border font-medium ${statusCfg.color}`}>
            <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock size={12} /> Uptime: <span className="text-slate-300 font-medium">{node.uptime}</span>
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <FolderSync size={12} /> Last sync: <span className="text-slate-300 font-medium">{node.lastSync}</span>
          </span>
          {activeWarnings.length > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border bg-orange-500/10 text-orange-400 border-orange-500/30 font-medium">
              <AlertTriangle size={11} /> {activeWarnings.length} active warning{activeWarnings.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* ── Time Range Selector ──────────────────────────────────────────── */}
      <div className="flex gap-2 justify-end">
        {(['1h', '6h', '24h'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              timeRange === range
                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                : 'bg-gray-500/10 text-gray-400 border border-gray-500/20 hover:border-gray-500/30'
            }`}
          >
            {range.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── Hardware Specs Card ──────────────────────────────────────────── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Cpu size={18} className="text-purple-400" /> Hardware Specifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-3 rounded border border-purple-500/20 bg-purple-500/5">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Cpu size={11} /> GPU Model</p>
              <p className="text-sm font-semibold text-purple-300">{node.hardware.gpuModel}</p>
            </div>
            <div className="p-3 rounded border border-cyan-500/20 bg-cyan-500/5">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><MemoryStick size={11} /> VRAM</p>
              <p className="text-sm font-semibold text-cyan-300">{node.hardware.vramCapacity}</p>
            </div>
            <div className="p-3 rounded border border-pink-500/20 bg-pink-500/5">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Server size={11} /> CPU Cores</p>
              <p className="text-sm font-semibold text-pink-300">{node.hardware.cpuCores} cores</p>
            </div>
            <div className="p-3 rounded border border-purple-500/20 bg-purple-500/5">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Database size={11} /> System RAM</p>
              <p className="text-sm font-semibold text-purple-300">{node.hardware.systemRam}</p>
            </div>
            <div className="p-3 rounded border border-cyan-500/20 bg-cyan-500/5">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><HardDrive size={11} /> Storage</p>
              <p className="text-sm font-semibold text-cyan-300">{node.hardware.storageCapacity}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Real-time Metrics ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Gauge size={14} /> GPU Utilization
            </p>
            <p className="text-2xl font-bold text-purple-400">{node.realtime.gpuUtil}%</p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-400 h-1.5 rounded-full transition-all"
                style={{ width: `${node.realtime.gpuUtil}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Thermometer size={14} /> Temperature
            </p>
            <p className={`text-2xl font-bold ${getTempColor(node.realtime.temperature)}`}>
              {node.realtime.temperature}°C
            </p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
              <div
                className={`bg-gradient-to-r ${getTempGradient(node.realtime.temperature)} h-1.5 rounded-full transition-all`}
                style={{ width: `${(node.realtime.temperature / 100) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <Zap size={14} /> Power Draw
            </p>
            <p className="text-2xl font-bold text-cyan-400">{node.realtime.powerDraw} W</p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(node.realtime.powerDraw / 500) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/40 backdrop-blur-md border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
              <MemoryStick size={14} /> VRAM Used
            </p>
            <p className="text-2xl font-bold text-pink-400">{node.realtime.vramUsed}</p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
              <div
                className="bg-gradient-to-r from-pink-500 to-purple-400 h-1.5 rounded-full transition-all"
                style={{ width: `${vramPct}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">of {node.realtime.vramTotal} ({vramPct.toFixed(1)}%)</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Historical Graphs ─────────────────────────────────────────────── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 size={18} /> Historical Metrics — Last {timeRange}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <MiniBarChart
              data={historyData}
              valueKey="gpuUtil"
              maxValue={maxGpuUtil}
              gradientClass="from-purple-500 to-pink-400"
              label="GPU Utilization %"
              unit="%"
            />
            <MiniBarChart
              data={historyData}
              valueKey="temperature"
              maxValue={maxTemp}
              gradientClass={getTempGradient(node.realtime.temperature)}
              label="Temperature °C"
              unit="°C"
            />
            <MiniBarChart
              data={historyData}
              valueKey="powerDraw"
              maxValue={maxPower}
              gradientClass="from-cyan-500 to-blue-500"
              label="Power Draw W"
              unit="W"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Active Processes ─────────────────────────────────────────────── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Bot size={18} className="text-cyan-400" /> Active Processes / Workloads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {node.processes.map((proc) => {
              const detail = node.processDetails[proc.id];
              const procStatus = getProcessStatusConfig(proc.status);
              return (
                <button
                  key={proc.id}
                  onClick={() => detail ? setSelectedProcess(detail) : undefined}
                  className={`w-full text-left p-4 rounded border border-slate-800 hover:border-purple-500/40 hover:bg-purple-500/5 transition group ${detail ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Bot size={14} className="text-purple-400 flex-shrink-0" />
                      <p className="text-sm font-semibold text-white group-hover:text-purple-300 truncate">{proc.modelName}</p>
                      <span className={`text-xs px-2 py-0.5 rounded border flex-shrink-0 ${procStatus.color}`}>
                        {procStatus.label}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 flex-shrink-0">started {proc.startedAt.split(' ')[1]}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-slate-500">Memory Used</p>
                      <p className="text-pink-400 font-semibold">{proc.memoryUsed}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Compute</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 bg-slate-700 rounded-full h-1">
                          <div className="bg-gradient-to-r from-purple-500 to-cyan-400 h-1 rounded-full" style={{ width: `${proc.computePct}%` }} />
                        </div>
                        <span className="text-purple-400 font-semibold">{proc.computePct}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-500">Temp Contribution</p>
                      <p className={`font-semibold ${getTempColor(proc.tempContribution + 40)}`}>+{proc.tempContribution}°C</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Est. completion</p>
                      <p className="text-cyan-400 font-semibold">{proc.estimatedCompletion ?? 'ongoing'}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Syncthing Status ─────────────────────────────────────────────── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <FolderSync size={18} className="text-cyan-400" /> Syncthing Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const syncCfg = getSyncConfig(node.syncthing.health);
            const syncPct = (parseFloat(node.syncthing.syncedBytes) / parseFloat(node.syncthing.totalBytes)) * 100;
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border text-sm font-semibold ${syncCfg.bgColor} ${syncCfg.color}`}>
                    <Wifi size={14} /> {syncCfg.label}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Last sync</p>
                      <p className="text-slate-200 font-medium">{node.syncthing.lastSyncTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Pending items</p>
                      <p className={`font-bold text-lg ${node.syncthing.pendingItems > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {node.syncthing.pendingItems}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Sync progress</span>
                    <span className="text-cyan-400 font-semibold">{node.syncthing.syncedBytes} / {node.syncthing.totalBytes}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(syncPct, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">{syncPct.toFixed(1)}% synced with orchestrator</p>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* ── Docker Containers ─────────────────────────────────────────────── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Container size={18} className="text-pink-400" /> Docker Containers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {node.containers.map((container) => {
              const containerStatus = getContainerStatusConfig(container.status);
              return (
                <div
                  key={container.id}
                  className="flex items-center gap-4 p-3 rounded border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{container.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded border ${containerStatus.color}`}>
                        {containerStatus.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono truncate">{container.image}</p>
                  </div>
                  <div className="text-right text-xs flex-shrink-0 space-y-0.5">
                    <p className="text-slate-400">CPU: <span className="text-cyan-400 font-semibold">{container.cpuPct}%</span></p>
                    <p className="text-slate-400">MEM: <span className="text-pink-400 font-semibold">{container.memUsed}</span></p>
                  </div>
                  <div className="text-right text-xs flex-shrink-0">
                    <p className="text-slate-500 flex items-center gap-1"><Clock size={10} /> {container.uptime}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Health Warnings ──────────────────────────────────────────────── */}
      <Card className="bg-card/40 backdrop-blur-md border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-400" /> Node Health Warnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {node.warnings.length === 0 ? (
            <div className="flex items-center gap-3 p-4 rounded border border-green-500/20 bg-green-500/5">
              <CheckCircle2 size={16} className="text-green-400" />
              <p className="text-sm text-green-300 font-medium">No health warnings — node operating normally.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {node.warnings.map((warning) => {
                const warnCfg = getWarningSeverityConfig(warning.severity);
                return (
                  <div key={warning.id} className={`p-4 rounded border ${warnCfg.border} ${warnCfg.bg}`}>
                    <div className="flex items-start gap-3">
                      {warnCfg.icon}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className={`text-sm font-semibold ${warnCfg.color}`}>{warning.message}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded border ${warnCfg.border} ${warnCfg.color} flex items-center gap-1`}>
                            {getWarningTypeIcon(warning.type)} {warning.type}
                          </span>
                          {warning.resolved && (
                            <span className="text-xs px-1.5 py-0.5 rounded border border-green-500/30 text-green-400 bg-green-500/5">
                              resolved
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{warning.detail}</p>
                        <p className="text-xs text-slate-600 mt-1">{warning.timestamp}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Process Detail Modal ─────────────────────────────────────────── */}
      {selectedProcess && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProcess(null)}
        >
          <div
            className="bg-black/95 border border-purple-500/30 rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-purple-400 flex-shrink-0" />
                <div>
                  <h2 className="text-white font-semibold">{selectedProcess.modelName}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedProcess.framework} · {selectedProcess.requestSource}</p>
                </div>
              </div>
              <button onClick={() => setSelectedProcess(null)} className="text-gray-400 hover:text-white transition ml-4 flex-shrink-0">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status + Times */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <span className={`text-xs px-2 py-0.5 rounded border ${getProcessStatusConfig(selectedProcess.status).color}`}>
                    {getProcessStatusConfig(selectedProcess.status).label}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Est. Completion</p>
                  <p className="text-sm font-semibold text-cyan-400">{selectedProcess.estimatedCompletion ?? 'Ongoing'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Started</p>
                  <p className="text-sm text-white">{selectedProcess.startedAt}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Context Length</p>
                  <p className="text-sm text-white">{selectedProcess.contextLength.toLocaleString()} tokens</p>
                </div>
              </div>

              {/* Throughput */}
              <div>
                <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Activity size={12} /> Throughput</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded border border-purple-500/20 bg-purple-500/5 text-center">
                    <p className="text-lg font-bold text-purple-400">{selectedProcess.tokensPerSec.toFixed(1)}</p>
                    <p className="text-xs text-slate-500">tokens/sec</p>
                  </div>
                  <div className="p-3 rounded border border-cyan-500/20 bg-cyan-500/5 text-center">
                    <p className="text-lg font-bold text-cyan-400">{selectedProcess.inputTokens.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">input tokens</p>
                  </div>
                  <div className="p-3 rounded border border-pink-500/20 bg-pink-500/5 text-center">
                    <p className="text-lg font-bold text-pink-400">{selectedProcess.outputTokens.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">output tokens</p>
                  </div>
                </div>
              </div>

              {/* Resource Breakdown */}
              <div>
                <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Gauge size={12} /> Resource Breakdown</p>
                <div className="space-y-3">
                  {selectedProcess.resourceBreakdown.map((rb) => (
                    <div key={rb.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">{rb.label}</span>
                        <span className="text-slate-200 font-medium">{rb.value}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div
                          className={`bg-gradient-to-r ${rb.color} h-1.5 rounded-full`}
                          style={{ width: `${Math.min(parseFloat(rb.value.match(/\((\d+(?:\.\d+)?)%\)/)?.[1] ?? '40'), 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Config Details */}
              <div className="pt-4 border-t border-purple-500/20">
                <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Server size={12} /> Configuration</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Batch Size', value: String(selectedProcess.batchSize) },
                    { label: 'Memory Used', value: selectedProcess.memoryUsed },
                    { label: 'Compute', value: `${selectedProcess.computePct}%` },
                    { label: 'Temp Contribution', value: `+${selectedProcess.tempContribution}°C` },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between p-2 rounded border border-slate-800">
                      <span className="text-xs text-slate-500">{item.label}</span>
                      <span className="text-xs text-slate-200 font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
