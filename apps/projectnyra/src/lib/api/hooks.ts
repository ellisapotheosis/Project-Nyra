import { useState, useCallback } from "react";
import { ApiError } from "./base";

export interface UseApiResponse<T> {
  data: T | null;
  error: ApiError | Error | null;
  isLoading: boolean;
  execute: (...args: any[]) => Promise<T>;
}

/**
 * Standard hook for executing API calls with loading and error states.
 */
export function useApi<T>(
  apiCall: (...args: any[]) => Promise<T>
): UseApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await apiCall(...args);
        setData(result);
        return result;
      } catch (err) {
        const apiErr = err instanceof Error ? err : new Error(String(err));
        setError(apiErr);
        throw apiErr;
      } finally {
        setIsLoading(false);
      }
    },
    [apiCall]
  );

  return { data, error, isLoading, execute };
}
