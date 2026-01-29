import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import PCDetectionScreen from './components/PCDetectionScreen';
import PrerequisitesScreen from './components/PrerequisitesScreen';
import NetworkConfigScreen from './components/NetworkConfigScreen';
import DockerSetupScreen from './components/DockerSetupScreen';
import TailscaleSetupScreen from './components/TailscaleSetupScreen';
import CloudflareSetupScreen from './components/CloudflareSetupScreen';
import ServiceDeploymentScreen from './components/ServiceDeploymentScreen';
import VLLMSetupScreen from './components/VLLMSetupScreen';
import GPUConfigScreen from './components/GPUConfigScreen';
import HealthCheckScreen from './components/HealthCheckScreen';
import CompletionScreen from './components/CompletionScreen';
import ProgressBar from './components/ProgressBar';
import './styles/App.css';

export interface BootstrapConfig {
  role: string;
  ip: string;
  tailscaleIP?: string;
  hostname: string;
  platform: string;
  gpuInfo?: string;
  dockerInstalled: boolean;
  servicesDeployed: boolean;
  // Phase 2 additions
  prerequisitesInstalled?: boolean;
  cloudflareTunnelId?: string;
  cloudflareDomain?: string;
  lmCacheEnabled?: boolean;
  hardwareInfo?: any;
}

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<BootstrapConfig>({
    role: '',
    ip: '',
    hostname: '',
    platform: '',
    dockerInstalled: false,
    servicesDeployed: false
  });

  const steps = [
    { id: 0, name: 'Welcome', component: WelcomeScreen },
    { id: 1, name: 'PC Detection', component: PCDetectionScreen },
    { id: 2, name: 'Prerequisites', component: PrerequisitesScreen },
    { id: 3, name: 'Network Config', component: NetworkConfigScreen },
    { id: 4, name: 'Docker Setup', component: DockerSetupScreen },
    { id: 5, name: 'Tailscale VPN', component: TailscaleSetupScreen },
    { id: 6, name: 'Cloudflare Tunnel', component: CloudflareSetupScreen },
    { id: 7, name: 'Services', component: ServiceDeploymentScreen },
    { id: 8, name: 'GPU/Inference', component: VLLMSetupScreen },
    { id: 9, name: 'Health Check', component: HealthCheckScreen },
    { id: 10, name: 'Complete', component: CompletionScreen }
  ];

  useEffect(() => {
    // Load saved configuration if exists
    window.bootstrap.loadConfig().then(result => {
      if (result.success && result.config) {
        setConfig(result.config);
        // Resume from appropriate step
        if (result.config.servicesDeployed) {
          setCurrentStep(7);
        } else if (result.config.dockerInstalled) {
          setCurrentStep(4);
        } else if (result.config.ip) {
          setCurrentStep(3);
        }
      }
    });
  }, []);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      // Save config on each step
      window.bootstrap.saveConfig(config);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateConfig = (updates: Partial<BootstrapConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const CurrentComponent = steps[currentStep].component;

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>Project Nyra Bootstrap Wizard</h1>
          <p>4-PC Distributed AI Mortgage Platform Setup</p>
        </div>
      </header>

      <ProgressBar
        steps={steps.map(s => s.name)}
        currentStep={currentStep}
      />

      <main className="app-main">
        <CurrentComponent
          config={config}
          updateConfig={updateConfig}
          nextStep={nextStep}
          prevStep={prevStep}
          isFirstStep={currentStep === 0}
          isLastStep={currentStep === steps.length - 1}
        />
      </main>

      <footer className="app-footer">
        <p>Project Nyra v1.0 | Dual Orchestrator Architecture | Claude Flow + Archon OS</p>
      </footer>
    </div>
  );
};

export default App;
