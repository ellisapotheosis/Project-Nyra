'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackMessage?: string;
  fallbackComponent?: React.ComponentType<{
    error: Error;
    resetError: () => void;
    errorInfo?: ErrorInfo;
  }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  showErrorDetails?: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorMessageRef = React.createRef<HTMLHeadingElement>();

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  componentDidUpdate(_: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    if (this.state.hasError && !prevState.hasError && this.errorMessageRef.current) {
      this.errorMessageRef.current.focus();
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });

    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (!this.props.children && !this.state.hasError) {
      return null;
    }

    if (this.state.hasError && this.state.error) {
      const { fallbackComponent: FallbackComponent, fallbackMessage, showErrorDetails } = this.props;

      if (FallbackComponent) {
        try {
          return (
            <FallbackComponent
              error={this.state.error}
              resetError={this.handleRetry}
              errorInfo={this.state.errorInfo || undefined}
            />
          );
        } catch (fallbackError) {
          console.error('Fallback component failed:', fallbackError);
        }
      }

      const isDevelopment = process.env.NODE_ENV === 'development';
      const shouldShowDetails = showErrorDetails ?? isDevelopment;

      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <Card className="max-w-2xl w-full border-destructive">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <CardTitle
                  ref={this.errorMessageRef}
                  tabIndex={-1}
                  className="text-destructive"
                >
                  {fallbackMessage || 'Something went wrong'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {this.state.error.message}
              </p>

              {shouldShowDetails && (
                <div className="space-y-3">
                  {this.state.error.stack && (
                    <details className="group">
                      <summary className="cursor-pointer font-medium text-sm hover:text-primary transition-colors">
                        Error Stack
                      </summary>
                      <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-auto max-h-64 border">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}

                  {this.state.errorInfo?.componentStack && (
                    <details className="group">
                      <summary className="cursor-pointer font-medium text-sm hover:text-primary transition-colors">
                        Component Stack
                      </summary>
                      <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-auto max-h-64 border">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={this.handleRetry}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
