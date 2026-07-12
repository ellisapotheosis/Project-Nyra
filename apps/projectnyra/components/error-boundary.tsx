"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center p-6 text-center">
          <Card className="max-w-md border-pink-500/20 bg-pink-500/5 shadow-[0_0_30px_-5px_rgba(var(--pink-rgb),0.2)]">
            <CardHeader>
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-pink-500/10 text-pink-400">
                <AlertTriangle className="size-6" />
              </div>
              <CardTitle className="text-xl font-bold text-foreground">
                Runtime Error Detected
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                The application encountered an unexpected issue while rendering
                this component. Terminal logs have been synchronized.
              </p>
              <div className="rounded-lg bg-black/40 p-3 text-left font-mono text-[10px] text-pink-400/80">
                {this.state.error?.message || "Unknown execution fault"}
              </div>
              <Button
                variant="outline"
                className="h-10 w-full border-pink-500/30 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="mr-2 size-4" />
                Reset Workspace
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
