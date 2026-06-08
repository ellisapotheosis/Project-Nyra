"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { trackMixpanelEvent } from "@/lib/mixpanel";

export function MixpanelRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedRoute = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!pathname) {
      return;
    }

    const query = searchParams?.toString() ?? "";
    const route = query ? `${pathname}?${query}` : pathname;

    if (lastTrackedRoute.current === route) {
      return;
    }

    lastTrackedRoute.current = route;
    trackMixpanelEvent("page_view", {
      path: pathname,
      route,
      search: query || undefined,
    });
  }, [pathname, searchParams]);

  return null;
}
