import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";
import { getRetryCount } from "@/shared/errors/retry-policy";

type UseSafeQueryOptions<
  TData = unknown,
  TError = unknown,
  TQueryKey extends QueryKey = QueryKey,
> = Omit<UseQueryOptions<TData, TError, TData, TQueryKey>, "retry">;

/**
 * Drop-in replacement for useQuery.
 * Automatically applies the FAOS retry policy — no per-component retry logic needed.
 */
export function useSafeQuery<
  TData = unknown,
  TError = unknown,
  TQueryKey extends QueryKey = QueryKey,
>(options: UseSafeQueryOptions<TData, TError, TQueryKey>) {
  return useQuery({
    ...options,
    retry: (count, error) => count < getRetryCount(error),
  });
}
