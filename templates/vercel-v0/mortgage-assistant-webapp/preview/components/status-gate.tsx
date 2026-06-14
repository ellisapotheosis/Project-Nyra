import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, RefreshCcw } from 'lucide-react';
import { ApiError } from '@/lib/api/base';

interface StatusGateProps<T> {
  data: T | null;
  error: ApiError | Error | null;
  isLoading: boolean;
  onRetry?: () => void;
  loadingMessage?: string;
  emptyMessage?: string;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => React.ReactNode;
}

/**
 * A standard component for handling API loading, error, and empty states.
 */
export function StatusGate<T>({
  data,
  error,
  isLoading,
  onRetry,
  loadingMessage = 'Loading data...',
  emptyMessage = 'No data found.',
  isEmpty = (d) => Array.isArray(d) && d.length === 0,
  children,
}: StatusGateProps<T>) {
  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">{loadingMessage}</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="flex flex-col items-center justify-center p-12 space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive">Request Failed</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {error.message || 'An unexpected error occurred while fetching data.'}
            </p>
          </div>
          {onRetry && (
            <Button variant="outline" onClick={onRetry} size="sm">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!data || (data && isEmpty(data))) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-12 space-y-2">
          <p className="text-lg font-medium text-muted-foreground">{emptyMessage}</p>
          <p className="text-sm text-muted-foreground">Once you add items, they will appear here.</p>
        </CardContent>
      </Card>
    );
  }

  return <>{children(data)}</>;
}
