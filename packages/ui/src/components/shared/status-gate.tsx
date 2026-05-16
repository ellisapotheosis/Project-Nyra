import type React from "react"
import { AlertCircle, Loader2, RefreshCcw } from "lucide-react"

import { ApiError } from "@/lib/api/base"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"

interface StatusGateProps<T> {
  data: T | null
  error: ApiError | Error | null
  isLoading: boolean
  onRetry?: () => void
  loadingMessage?: string
  emptyMessage?: string
  isEmpty?: (data: T) => boolean
  children: (data: T) => React.ReactNode
}

export function StatusGate<T>({
  data,
  error,
  isLoading,
  onRetry,
  loadingMessage = "Loading records...",
  emptyMessage = "No records found.",
  isEmpty = (value) => Array.isArray(value) && value.length === 0,
  children,
}: StatusGateProps<T>) {
  if (isLoading && !data) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-lg border border-border/50 bg-card/30 p-10 text-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <div>
          <p className="text-sm font-semibold text-foreground">{loadingMessage}</p>
          <p className="mt-1 text-xs text-muted-foreground">Waiting on the service boundary.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/40 bg-destructive/5">
        <CardContent className="flex min-h-[260px] flex-col items-center justify-center gap-5 p-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10">
            <AlertCircle className="size-7 text-destructive" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-destructive">Service request failed</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {error.message || "The upstream service did not return a usable response."}
            </p>
          </div>
          {onRetry && (
            <Button variant="outline" onClick={onRetry} className="border-destructive/30 text-destructive hover:bg-destructive/10">
              <RefreshCcw className="mr-2 size-4" />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (!data || isEmpty(data)) {
    return (
      <Card className="border-dashed border-border/70 bg-card/30">
        <CardContent className="flex min-h-[260px] flex-col items-center justify-center gap-4 p-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-lg border border-border/60 bg-background/60">
            <AlertCircle className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{emptyMessage}</p>
            <p className="mt-1 text-xs text-muted-foreground">Nothing is available for this view yet.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return <>{children(data)}</>
}
