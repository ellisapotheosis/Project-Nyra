'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Check, X, Copy } from 'lucide-react';

interface TokenClaim {
  key: string;
  value: any;
  type: string;
}

interface TokenTestResult {
  valid: boolean;
  expired: boolean;
  message: string;
  header?: Record<string, any>;
  payload?: Record<string, any>;
  claims?: TokenClaim[];
}

export function TokenTester() {
  const [token, setToken] = useState('');
  const [result, setResult] = useState<TokenTestResult | null>(null);
  const [copied, setCopied] = useState(false);

  const decodeToken = (jwt: string): TokenTestResult => {
    try {
      const parts = jwt.trim().split('.');

      if (parts.length !== 3) {
        return {
          valid: false,
          expired: false,
          message: 'Invalid JWT format. Expected 3 parts separated by dots.',
        };
      }

      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));

      const now = Math.floor(Date.now() / 1000);
      let expired = false;
      let message = 'Token is valid';

      if (payload.exp) {
        expired = payload.exp < now;
        if (expired) {
          message = `Token expired at ${new Date(payload.exp * 1000).toLocaleString()}`;
        } else {
          const expiresIn = payload.exp - now;
          message = `Token expires in ${formatSeconds(expiresIn)}`;
        }
      }

      const claims: TokenClaim[] = Object.entries(payload).map(([key, value]) => ({
        key,
        value,
        type: typeof value === 'number' && (key === 'exp' || key === 'iat') ? 'timestamp' : typeof value,
      }));

      return {
        valid: true,
        expired,
        message,
        header,
        payload,
        claims,
      };
    } catch (error) {
      return {
        valid: false,
        expired: false,
        message: `Error decoding token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  };

  const formatSeconds = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const handleValidate = () => {
    if (!token.trim()) {
      setResult({
        valid: false,
        expired: false,
        message: 'Please paste a token to validate',
      });
      return;
    }
    const decoded = decodeToken(token);
    setResult(decoded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Tester</CardTitle>
        <CardDescription>
          Decode and validate JWT tokens to inspect claims
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="token-input">JWT Token</Label>
          <textarea
            id="token-input"
            placeholder="Paste your JWT token here..."
            className="w-full h-32 p-3 rounded-md border border-input bg-background text-sm font-mono"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Tokens are decoded client-side only. Your tokens are never sent to any server.
          </p>
        </div>

        <Button onClick={handleValidate} className="w-full">
          Validate Token
        </Button>

        {result && (
          <div className="space-y-4 pt-4 border-t">
            <div
              className={`p-4 rounded-md border-l-4 flex items-start gap-3 ${
                result.valid
                  ? result.expired
                    ? 'bg-yellow-950/20 border-yellow-500'
                    : 'bg-green-950/20 border-green-500'
                  : 'bg-red-950/20 border-red-500'
              }`}
            >
              {result.valid ? (
                result.expired ? (
                  <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                )
              ) : (
                <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`font-medium ${
                    result.valid
                      ? result.expired
                        ? 'text-yellow-50'
                        : 'text-green-50'
                      : 'text-red-50'
                  }`}
                >
                  {result.valid ? (result.expired ? 'Expired' : 'Valid') : 'Invalid'}: {result.message}
                </p>
              </div>
            </div>

            {result.valid && result.payload && (
              <>
                <div>
                  <h3 className="text-sm font-semibold mb-3">Token Claims</h3>
                  <div className="bg-muted/50 rounded p-4 space-y-2 max-h-96 overflow-y-auto">
                    {result.claims?.map((claim) => (
                      <div key={claim.key} className="flex justify-between items-start gap-2 pb-2 border-b last:border-b-0">
                        <div>
                          <div className="font-mono text-sm font-medium">{claim.key}</div>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {claim.type}
                          </Badge>
                        </div>
                        <div className="text-right max-w-xs">
                          {claim.type === 'timestamp' ? (
                            <div>
                              <div className="text-xs text-muted-foreground">
                                {formatTimestamp(claim.value as number)}
                              </div>
                              <div className="text-xs font-mono">{claim.value}</div>
                            </div>
                          ) : typeof claim.value === 'object' ? (
                            <div className="text-xs font-mono text-muted-foreground">
                              {JSON.stringify(claim.value).substring(0, 50)}...
                            </div>
                          ) : (
                            <div className="text-sm">{String(claim.value)}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Token Header</h3>
                  <div className="bg-muted/50 rounded p-3 text-xs font-mono">
                    <pre className="whitespace-pre-wrap break-words">
                      {JSON.stringify(result.header, null, 2)}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-2"
                      onClick={() => copyToClipboard(JSON.stringify(result.header, null, 2))}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Full Payload</h3>
                  <div className="bg-muted/50 rounded p-3 text-xs font-mono max-h-48 overflow-y-auto">
                    <pre className="whitespace-pre-wrap break-words">
                      {JSON.stringify(result.payload, null, 2)}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-2"
                      onClick={() => copyToClipboard(JSON.stringify(result.payload, null, 2))}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <div className="bg-blue-950/20 border border-blue-500/20 rounded-md p-3 text-sm text-muted-foreground mt-4">
          <p className="font-semibold text-blue-50 mb-1">What you can see:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Token validity (format, expiration)</li>
            <li>All claims in the token payload</li>
            <li>Token header information</li>
            <li>Expiration time and countdown</li>
            <li>Data types for each claim</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}