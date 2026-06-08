"use client";

import type { User } from "@supabase/supabase-js";
import mixpanel from "mixpanel-browser";

type MixpanelProperties = Record<string, unknown>;

type MixpanelIdentity = Pick<
  User,
  "app_metadata" | "email" | "id" | "user_metadata"
>;

let initializedToken: string | null = null;
const baseProperties = {
  app: "projectnyra",
  platform: "web",
} as const;

function getEnvValue(value: string | undefined) {
  if (!value || value.trim() === "" || value.includes("replace-me")) {
    return null;
  }

  return value;
}

export function getMixpanelToken() {
  return getEnvValue(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN);
}

function ensureMixpanelClient() {
  if (typeof window === "undefined") {
    return null;
  }

  const token = getMixpanelToken();
  if (!token) {
    return null;
  }

  if (initializedToken !== token) {
    mixpanel.init(token, {
      debug: process.env.NODE_ENV !== "production",
      ignore_dnt: true,
      persistence: "localStorage",
      track_pageview: false,
    });
    mixpanel.register(baseProperties);
    initializedToken = token;
  }

  return mixpanel;
}

function withBaseProperties(properties: MixpanelProperties = {}) {
  return {
    ...baseProperties,
    ...properties,
  };
}

export function trackMixpanelEvent(
  eventName: string,
  properties: MixpanelProperties = {}
) {
  const client = ensureMixpanelClient();
  if (!client) {
    return;
  }

  client.track(eventName, withBaseProperties(properties));
}

export function identifyMixpanelUser(
  user: MixpanelIdentity,
  properties: MixpanelProperties = {}
) {
  const client = ensureMixpanelClient();
  if (!client) {
    return;
  }

  client.identify(user.id);
  client.people?.set?.(
    withBaseProperties({
      $email: user.email ?? undefined,
      auth_provider: user.app_metadata?.provider ?? "email",
      full_name:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email ??
        undefined,
      ...properties,
    })
  );
}

export function resetMixpanel() {
  if (typeof window === "undefined" || !getMixpanelToken()) {
    return;
  }

  mixpanel.reset();
}
