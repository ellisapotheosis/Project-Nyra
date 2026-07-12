import { useState, useCallback } from "react";
import { ApiError } from "./base";
import { useToast } from "@/hooks/use-toast";

export interface UseApiResponse<T, TArgs extends unknown[] = unknown[]> {
  data: T | null;
  error: ApiError | Error | null;
  isLoading: boolean;
  execute: (...args: TArgs) => Promise<T>;
}

/**
 * Standard hook for executing API calls with loading and error states.
 */
export function useApi<T, TArgs extends unknown[] = unknown[]>(
  apiCall: (...args: TArgs) => Promise<T>
): UseApiResponse<T, TArgs> {
  const { toast } = useToast();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const execute = useCallback(
    async (...args: TArgs): Promise<T> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await apiCall(...args);
        setData(result);
        return result;
      } catch (err) {
        const apiErr = err instanceof Error ? err : new Error(String(err));
        setError(apiErr);

        toast({
          variant: "destructive",
          title: "System Execution Fault",
          description: apiErr.message,
        });

        throw apiErr;
      } finally {
        setIsLoading(false);
      }
    },
    [apiCall]
  );

  return { data, error, isLoading, execute };
}
