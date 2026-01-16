/**
 * Hardware Detection Usage Examples
 * Demonstrates various use cases for the hardware detection module
 */

import React, { useEffect, useState } from 'react';
import { getHardwareDetector, HardwareInfo, quickDetect } from '../services/hardwareDetector';
import HardwareDetectionDisplay from '../components/HardwareDetectionDisplay';
import { useInstallStore } from '../store/installStore';

// ============================================================================
// Example 1: Basic Hardware Detection
// ============================================================================

export function BasicDetectionExample() {
  const [hardware, setHardware] = useState<HardwareInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function detect() {
      try {
        const detector = await getHardwareDetector();
        const result = await detector.detectAll();
        setHardware(result);
      } catch (error) {
        console.error('Detection failed:', error);
      } finally {
        setLoading(false);
      }
    }
    detect();
  }, []);

  if (loading) return <div>Detecting hardware...</div>;
  if (!hardware) return <div>Detection failed</div>;

  return (
    <div>
      <h2>System: {hardware.system.hostname}</h2>
      <p>CPU: {hardware.cpu.model}</p>
      <p>RAM: {hardware.ram.totalGB} GB</p>
      <p>GPUs: {hardware.gpus.length}</p>
    </div>
  );
}

// ============================================================================
// Example 2: Using HardwareDetectionDisplay Component
// ============================================================================

export function ComponentExample() {
  const handleComplete = (hardware: HardwareInfo) => {
    console.log('Hardware detected:', hardware);

    // Use the information
    if (hardware.gpus.some(gpu => gpu.isNvidia)) {
      console.log('NVIDIA GPU detected - can install AI services');
    }
  };

  return (
    <div>
      <h1>Hardware Detection</h1>
      <HardwareDetectionDisplay
        onDetectionComplete={handleComplete}
        autoDetect={true}
      />
    </div>
  );
}

// ============================================================================
// Example 3: Integration with Installer Store
// ============================================================================

export function StoreIntegrationExample() {
  const setDetectedHardware = useInstallStore(state => state.setDetectedHardware);
  const detectedHardware = useInstallStore(state => state.detectedHardware);

  const detectAndStore = async () => {
    const detector = await getHardwareDetector();
    const hardware = await detector.detectAll();

    // Store in Zustand store
    setDetectedHardware(hardware);

    console.log('Hardware stored in global state');
  };

  return (
    <div>
      <button onClick={detectAndStore}>Detect Hardware</button>

      {detectedHardware && (
        <div>
          <p>Stored: {detectedHardware.system.hostname}</p>
          <p>Detected at: {detectedHardware.detectedAt.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 4: Tailscale Configuration
// ============================================================================

export function TailscaleConfigExample() {
  const [hardware, setHardware] = useState<HardwareInfo | null>(null);
  const [tailscaleConfig, setTailscaleConfig] = useState<any>(null);

  useEffect(() => {
    async function setup() {
      const detector = await getHardwareDetector();
      const hw = await detector.detectAll();
      setHardware(hw);

      // Configure Tailscale based on detected hardware
      const activeInterfaces = hw.networkInterfaces.filter(i => i.isActive);
      const primaryInterface = activeInterfaces.find(i => i.type === 'Ethernet')
        || activeInterfaces[0];

      if (primaryInterface) {
        const config = {
          hostname: hw.system.hostname,
          advertiseRoutes: [primaryInterface.ipv4],
          acceptRoutes: true,
          exitNode: false,
        };

        setTailscaleConfig(config);
        console.log('Tailscale config:', config);
      }
    }
    setup();
  }, []);

  return (
    <div>
      <h2>Tailscale Configuration</h2>
      {tailscaleConfig && (
        <pre>{JSON.stringify(tailscaleConfig, null, 2)}</pre>
      )}
    </div>
  );
}

// ============================================================================
// Example 5: Cloudflared Tunnel Configuration
// ============================================================================

export function CloudflaredConfigExample() {
  const [hardware, setHardware] = useState<HardwareInfo | null>(null);
  const [tunnelConfig, setTunnelConfig] = useState<any>(null);

  useEffect(() => {
    async function setup() {
      const detector = await getHardwareDetector();
      const hw = await detector.detectAll();
      setHardware(hw);

      // Get primary network interface
      const activeInterfaces = hw.networkInterfaces.filter(i => i.isActive);
      const primaryInterface = activeInterfaces[0];

      if (primaryInterface) {
        const config = {
          tunnel: hw.system.hostname.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          credentials_file: `/root/.cloudflared/${hw.system.hostname}-creds.json`,
          ingress: [
            {
              hostname: `${hw.system.hostname}.example.com`,
              service: `http://${primaryInterface.ipv4}:80`,
            },
            {
              service: 'http_status:404',
            },
          ],
        };

        setTunnelConfig(config);
        console.log('Cloudflared config:', config);
      }
    }
    setup();
  }, []);

  return (
    <div>
      <h2>Cloudflared Tunnel Configuration</h2>
      {tunnelConfig && (
        <pre>{JSON.stringify(tunnelConfig, null, 2)}</pre>
      )}
    </div>
  );
}

// ============================================================================
// Example 6: Wake-on-LAN Setup
// ============================================================================

export function WakeOnLANExample() {
  const [hardware, setHardware] = useState<HardwareInfo | null>(null);
  const [wolDevices, setWolDevices] = useState<any[]>([]);

  useEffect(() => {
    async function setup() {
      const detector = await getHardwareDetector();
      const hw = await detector.detectAll();
      setHardware(hw);

      // Extract WoL-compatible interfaces (Ethernet only)
      const devices = hw.networkInterfaces
        .filter(iface => iface.type === 'Ethernet')
        .map(iface => ({
          name: hw.system.hostname,
          mac: iface.macAddress,
          ip: iface.ipv4,
          broadcast: iface.ipv4?.split('.').slice(0, 3).join('.') + '.255',
        }));

      setWolDevices(devices);
      console.log('WoL devices:', devices);
    }
    setup();
  }, []);

  return (
    <div>
      <h2>Wake-on-LAN Configuration</h2>
      {wolDevices.map((device, idx) => (
        <div key={idx} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
          <p><strong>Device:</strong> {device.name}</p>
          <p><strong>MAC:</strong> {device.mac}</p>
          <p><strong>IP:</strong> {device.ip}</p>
          <p><strong>Broadcast:</strong> {device.broadcast}</p>
          <button onClick={() => console.log('Send WoL packet to', device.mac)}>
            Wake Up
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Example 7: GPU-based Service Recommendation
// ============================================================================

export function ServiceRecommendationExample() {
  const [hardware, setHardware] = useState<HardwareInfo | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    async function analyze() {
      const detector = await getHardwareDetector();
      const hw = await detector.detectAll();
      setHardware(hw);

      const recs: string[] = [];

      // Check GPU capabilities
      const hasNvidiaGPU = hw.gpus.some(gpu => gpu.isNvidia);
      const highVRAM = hw.gpus.some(gpu => {
        const vram = parseInt(gpu.vram.replace(/[^0-9]/g, ''));
        return vram >= 12;
      });

      if (hasNvidiaGPU && highVRAM) {
        recs.push('Ollama (Local LLM inference)');
        recs.push('ComfyUI (Image generation)');
        recs.push('Stable Diffusion WebUI');
      }

      // Check RAM
      if (hw.ram.totalGB >= 32) {
        recs.push('Neo4j (Graph database)');
        recs.push('Elasticsearch (Search engine)');
      }

      // Check CPU
      if (hw.cpu.cores >= 8) {
        recs.push('Docker Swarm orchestration');
        recs.push('Multiple service containers');
      }

      setRecommendations(recs);
    }
    analyze();
  }, []);

  return (
    <div>
      <h2>Recommended Services</h2>
      <p>Based on your hardware, we recommend:</p>
      <ul>
        {recommendations.map((rec, idx) => (
          <li key={idx}>{rec}</li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// Example 8: System Requirements Validation
// ============================================================================

export function SystemValidationExample() {
  const [hardware, setHardware] = useState<HardwareInfo | null>(null);
  const [validation, setValidation] = useState<any>(null);

  useEffect(() => {
    async function validate() {
      const detector = await getHardwareDetector();
      const hw = await detector.detectAll();
      setHardware(hw);

      const checks = {
        cpu: {
          required: 4,
          actual: hw.cpu.cores,
          passed: hw.cpu.cores >= 4,
        },
        ram: {
          required: 16,
          actual: hw.ram.totalGB,
          passed: hw.ram.totalGB >= 16,
        },
        gpu: {
          required: 1,
          actual: hw.gpus.length,
          passed: hw.gpus.length > 0,
        },
        network: {
          required: 1,
          actual: hw.networkInterfaces.filter(i => i.isActive).length,
          passed: hw.networkInterfaces.some(i => i.isActive),
        },
      };

      setValidation(checks);
    }
    validate();
  }, []);

  if (!validation) return <div>Validating system...</div>;

  const allPassed = Object.values(validation).every((v: any) => v.passed);

  return (
    <div>
      <h2>System Requirements</h2>
      <div style={{ color: allPassed ? 'green' : 'red' }}>
        {allPassed ? '✓ All requirements met' : '✗ Some requirements not met'}
      </div>

      {Object.entries(validation).map(([key, check]: [string, any]) => (
        <div key={key} style={{ margin: '10px 0' }}>
          <strong>{key.toUpperCase()}:</strong>
          {' '}
          {check.actual} / {check.required} required
          {' '}
          <span style={{ color: check.passed ? 'green' : 'red' }}>
            {check.passed ? '✓' : '✗'}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Example 9: Quick Detection (Fast Fallback)
// ============================================================================

export function QuickDetectionExample() {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    async function detect() {
      // Ultra-fast detection using only Node.js os module
      const basicInfo = await quickDetect();
      setInfo(basicInfo);
    }
    detect();
  }, []);

  if (!info) return <div>Loading...</div>;

  return (
    <div>
      <h2>Quick Detection (< 100ms)</h2>
      <p>Hostname: {info.system?.hostname}</p>
      <p>Platform: {info.system?.platform}</p>
      <p>CPU: {info.cpu?.model}</p>
      <p>Cores: {info.cpu?.cores}</p>
      <p>RAM: {info.ram?.totalGB} GB</p>
    </div>
  );
}

// ============================================================================
// Example 10: Selective Detection (Performance Optimization)
// ============================================================================

export function SelectiveDetectionExample() {
  const [cpuInfo, setCpuInfo] = useState<any>(null);
  const [networkInfo, setNetworkInfo] = useState<any>(null);

  const detectCPU = async () => {
    const detector = await getHardwareDetector();
    const cpu = await detector.detectCPU();
    setCpuInfo(cpu);
  };

  const detectNetwork = async () => {
    const detector = await getHardwareDetector();
    const network = await detector.detectNetwork();
    setNetworkInfo(network);
  };

  return (
    <div>
      <h2>Selective Detection</h2>
      <button onClick={detectCPU}>Detect CPU Only</button>
      <button onClick={detectNetwork}>Detect Network Only</button>

      {cpuInfo && (
        <div>
          <h3>CPU Info</h3>
          <pre>{JSON.stringify(cpuInfo, null, 2)}</pre>
        </div>
      )}

      {networkInfo && (
        <div>
          <h3>Network Info</h3>
          <pre>{JSON.stringify(networkInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
