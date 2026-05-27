"use client";

import React from "react";

export { ApiError } from "./base";
export { campaignApi } from "./campaigns";
export type { Campaign, CampaignStep } from "./campaigns";
export { crmApi } from "./crm";
export type { ConversationLog, Lead } from "./crm";
export { quoteApi } from "./quotes";
export type {
  ComparisonResponse,
  LoanType,
  QuoteRequest,
  QuoteResult,
} from "./quotes";

export function useApi<TArgs extends unknown[], TResult>(
  apiCall: (...args: TArgs) => Promise<TResult>
) {
  const [data, setData] = React.useState<TResult | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const execute = React.useCallback(
    async (...args: TArgs) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await apiCall(...args);
        setData(result);
        return result;
      } catch (caught) {
        const normalized =
          caught instanceof Error ? caught : new Error(String(caught));
        setError(normalized);
        throw normalized;
      } finally {
        setIsLoading(false);
      }
    },
    [apiCall]
  );

  return { data, error, isLoading, execute };
}
