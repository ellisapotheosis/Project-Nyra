import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PageSkeleton({
  cards = 4,
  rows = 4,
}: {
  cards?: number;
  rows?: number;
}) {
  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div className="space-y-3">
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="h-9 w-full max-w-md animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cards }).map((_, index) => (
          <Card key={index} className="border-border/40 bg-card/40">
            <CardHeader>
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-8 w-20 animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-border/40 bg-card/40">
        <CardContent className="space-y-4 p-5">
          {Array.from({ length: rows }).map((_, index) => (
            <div
              key={index}
              className="h-14 animate-pulse rounded-lg bg-muted/80"
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
