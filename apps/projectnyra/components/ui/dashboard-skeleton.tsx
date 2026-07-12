"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CommandStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-border/40 bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="size-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PriorityQueueSkeleton() {
  return (
    <div className="grid gap-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-border/40 bg-card/40">
          <CardContent className="flex items-start gap-4 p-4">
            <Skeleton className="size-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-4 w-24 mt-2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function LeadRadarSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-card/20"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
          <Skeleton className="h-2 w-10" />
        </div>
      ))}
    </div>
  );
}
