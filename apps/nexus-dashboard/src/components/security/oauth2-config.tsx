'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Copy, Check } from 'lucide-react';

interface OAuth2Config {
  enabled: boolean;
  jwksEndpoint: string;
  expectedIssuer: string;
  expectedAudience: string;
  validateToken: boolean;
}

interface OAuth2ConfigProps {
  onConfigChange?: (config: OAuth2Config) => void;
}

export function OAuth2Config({ onConfigChange }: OAuth2ConfigProps) {
  const [config, setConfig] = useState<OAuth2Config>({
    enabled: false,
    jwksEndpoint: '',
    expectedIssuer: '',
    expectedAudience: '',
    validateToken: true,
  });

  const [testToken, setTestToken] = useState('');
  const [testResult, setTestResult] = useState<{
    valid: boolean;
    message: string;
    claims?: Record<string, any>;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConfigChange = (field: keyof OAuth2Config, value: any) => {
    const updatedConfig = { ...config, [field]: value };
    setConfig(updatedConfig);
    onConfigChange?.(updatedConfig);
  };

  const handleTestToken = async () => {
    if (!testToken.trim()) {
      setTestResult({
        valid: false,
        message: 'Please paste a token to test',
      });
      return;
    }

    try {
      const parts = testToken.split('.');
      if (parts.length !== 3) {
        setTestResult({
          valid: false,
          message: 'Invalid token format. JWT should have 3 parts separated by dots.',
        });
        return;
      }

      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);

      let message = 'Token decoded successfully';
      let valid = true;

      if (payload.exp && payload.exp < now) {
        message += ' (EXPIRED)';
        valid = false;
      }

      if (config.validateToken) {
        if (config.expectedIssuer && payload.iss !== config.expectedIssuer) {
          valid = false;
          message = `Issuer mismatch. Expected: ${config.expectedIssuer}, Got: ${payload.iss}`;
        } else if (config.expectedAudience && payload.aud !== config.expectedAudience) {
          valid = false;
          message = `Audience mismatch. Expected: ${config.expectedAudience}, Got: ${payload.aud}`;
        }
      }

      setTestResult({
        valid,
        message,
        claims: payload,
      });
    } catch (error) {
      setTestResult({
        valid: false,
        message: `Error decoding token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>OAuth2 Configuration</CardTitle>
          <CardDescription>
            Configure OAuth2 settings for token validation and authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="oauth2-enabled" className="text-base">
                Enable OAuth2 Authentication
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Enable OAuth2 token validation for all API requests
              </p>
            </div>
            <Switch
              id="oauth2-enabled"
              checked={config.enabled}
              onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
            />
          </div>

          {config.enabled && (
            <>
              <Separator />

              <div className="space-y-2">
                <Label htmlFor="jwks-endpoint">JWKS Endpoint</Label>
                <Input
                  id="jwks-endpoint"
                  placeholder="https://auth.example.com/.well-known/jwks.json"
                  value={config.jwksEndpoint}
                  onChange={(e) => handleConfigChange('jwksEndpoint', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  URL to the JSON Web Key Set for token validation
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected-issuer">Expected Issuer</Label>
                <Input
                  id="expected-issuer"
                  placeholder="https://auth.example.com/"
                  value={config.expectedIssuer}
                  onChange={(e) => handleConfigChange('expectedIssuer', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The issuer claim (iss) expected in tokens
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected-audience">Expected Audience</Label>
                <Input
                  id="expected-audience"
                  placeholder="nexus-api"
                  value={config.expectedAudience}
                  onChange={(e) => handleConfigChange('expectedAudience', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The audience claim (aud) expected in tokens
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="validate-token" className="text-base">
                    Validate Token Claims
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Validate issuer and audience against configuration
                  </p>
                </div>
                <Switch
                  id="validate-token"
                  checked={config.validateToken}
                  onCheckedChange={(checked) => handleConfigChange('validateToken', checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {config.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Token Validator</CardTitle>
            <CardDescription>
              Test and validate JWT tokens against your OAuth2 configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-token">Token to Test</Label>
              <textarea
                id="test-token"
                placeholder="Paste your JWT token here..."
                className="w-full h-32 p-3 rounded-md border border-input bg-background text-sm font-mono"
                value={testToken}
                onChange={(e) => setTestToken(e.target.value)}
              />
            </div>

            <Button onClick={handleTestToken} className="w-full">
              Validate Token
            </Button>

            {testResult && (
              <div
                className={`p-4 rounded-md border-l-4 ${
                  testResult.valid
                    ? 'bg-green-950/20 border-green-500'
                    : 'bg-red-950/20 border-red-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                      testResult.valid ? 'text-green-500' : 'text-red-500'
                    }`}
                  />
                  <div>
                    <p className={`font-medium ${testResult.valid ? 'text-green-50' : 'text-red-50'}`}>
                      {testResult.valid ? 'Valid' : 'Invalid'}: {testResult.message}
                    </p>
                    {testResult.claims && (
                      <div className="mt-3 bg-background/50 rounded p-3 text-xs font-mono text-muted-foreground max-h-40 overflow-y-auto">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">Claims</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              copyToClipboard(JSON.stringify(testResult.claims, null, 2))
                            }
                          >
                            {copied ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <pre className="whitespace-pre-wrap break-words">
                          {JSON.stringify(testResult.claims, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}