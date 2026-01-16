import React, { useState } from 'react';
import { BootstrapConfig } from '../App';

interface Props {
  config: BootstrapConfig;
  updateConfig: (updates: Partial<BootstrapConfig>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const TailscaleSetupScreen: React.FC<Props> = ({ config, updateConfig, nextStep, prevStep }) => {
  const [authKey, setAuthKey] = useState('');
  const [useOAuth, setUseOAuth] = useState(true);
  const [setting, setSetting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSetup = async () => {
    setSetting(true);
    setResult(null);

    try {
      const res = await window.bootstrap.setupTailscale(useOAuth ? '' : authKey);
      setResult(res);

      if (res.success) {
        updateConfig({ tailscaleIP: res.tailscaleIP });
        setTimeout(() => nextStep(), 2000);
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    } finally {
      setSetting(false);
    }
  };

  return (
    <div className="screen-container">
      <h2>Tailscale VPN Setup</h2>

      <div className="info-box">
        <h3>Why Tailscale?</h3>
        <p>Tailscale creates a secure mesh VPN (100.64.0.x addresses) that allows:</p>
        <ul>
          <li>Zero-trust network access between all 4 PCs</li>
          <li>Secure remote access to your cluster from anywhere</li>
          <li>Encrypted point-to-point connections</li>
          <li>No exposed ports or complex firewall rules</li>
        </ul>
      </div>

      <div className="auth-method">
        <h3>Authentication Method:</h3>

        <div className="radio-group">
          <label className={`radio-option ${useOAuth ? 'selected' : ''}`}>
            <input
              type="radio"
              checked={useOAuth}
              onChange={() => setUseOAuth(true)}
            />
            <div>
              <strong>OAuth Login (Recommended)</strong>
              <p>Opens browser for secure authentication with your Tailscale account</p>
            </div>
          </label>

          <label className={`radio-option ${!useOAuth ? 'selected' : ''}`}>
            <input
              type="radio"
              checked={!useOAuth}
              onChange={() => setUseOAuth(false)}
            />
            <div>
              <strong>Auth Key</strong>
              <p>Use a pre-generated authentication key from Tailscale admin console</p>
            </div>
          </label>
        </div>

        {!useOAuth && (
          <div className="auth-key-input">
            <label>Tailscale Auth Key:</label>
            <input
              type="password"
              value={authKey}
              onChange={(e) => setAuthKey(e.target.value)}
              placeholder="tskey-auth-xxxxxxxxxxxx"
            />
            <p className="help-text">
              Generate an auth key at: <a href="https://login.tailscale.com/admin/settings/keys" target="_blank">https://login.tailscale.com/admin/settings/keys</a>
            </p>
          </div>
        )}
      </div>

      {result && (
        <div className={`result-box ${result.success ? 'success' : 'error'}`}>
          <h4>{result.success ? '✓ Connected' : '✗ Connection Failed'}</h4>
          <p>{result.message}</p>
          {result.success && result.tailscaleIP && (
            <div className="tailscale-ip">
              <strong>Your Tailscale IP:</strong> {result.tailscaleIP}
            </div>
          )}
        </div>
      )}

      <div className="button-group">
        <button className="btn-secondary" onClick={prevStep} disabled={setting}>
          ← Back
        </button>
        <button
          className="btn-primary"
          onClick={handleSetup}
          disabled={setting || (!useOAuth && !authKey)}
        >
          {setting ? 'Connecting...' : 'Setup Tailscale →'}
        </button>
      </div>

      <div className="skip-option">
        <button className="btn-link" onClick={nextStep}>
          Skip Tailscale (not recommended)
        </button>
      </div>

      {setting && (
        <div className="progress-indicator">
          <div className="spinner"></div>
          <p>{useOAuth ? 'Opening browser for authentication...' : 'Connecting to Tailscale network...'}</p>
        </div>
      )}
    </div>
  );
};

export default TailscaleSetupScreen;
