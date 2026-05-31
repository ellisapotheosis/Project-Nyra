'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card"

export default function ApplicationsPage() {
  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Applications</h1>
        <p className="mt-2 text-muted-foreground">
          Consolidated application visibility from the mortgage CRM surface, now inside the main internal webapp.
        </p>
      </div>

      <div className="grid gap-4">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="p-4 bg-primary/10 rounded-full text-primary">
              <FileText className="h-10 w-10" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold">Coming Soon</h3>
              <p className="text-muted-foreground max-w-sm">
                Application tracking and document pipeline are currently being migrated to the Twenty CRM integration.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
