import { NextResponse } from "next/server";

import {
  canUseMockFallback,
  getMissingProductionServiceConfig,
  getServiceDependencyStatus,
  NYRA_IS_PRODUCTION,
} from "@/lib/api/config";

export function GET() {
  const dependencies = getServiceDependencyStatus();
  const missingProductionConfig = getMissingProductionServiceConfig();
  const ready =
    !NYRA_IS_PRODUCTION ||
    canUseMockFallback() ||
    missingProductionConfig.length === 0;

  return NextResponse.json(
    {
      ready,
      production: NYRA_IS_PRODUCTION,
      mocksEnabled: canUseMockFallback(),
      dependencies,
      missingProductionConfig,
    },
    { status: ready ? 200 : 503 }
  );
}
