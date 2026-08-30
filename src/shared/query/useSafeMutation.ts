import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { mapApiValidationToForm } from "@/shared/errors/map-validation";

type UseSafeMutationOptions<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
> = Omit<UseMutationOptions<TData, TError, TVariables, TContext>, "onError"> & {
  /**
   * Called with mapped field errors when the API returns a VALIDATION (422) error.
   * Use this to bind errors to a form library (e.g., react-hook-form's setError).
   */
  onValidationError?: (fields: Record<string, string[]>) => void;
};

/**
 * Drop-in replacement for useMutation.
 *
 * Logging, toasts, and logout-on-AUTH are handled globally by the
 * MutationCache configured in `shared/lib/providers/query-provider.tsx` —
 * this wrapper does NOT repeat them (doing so would double-toast / double-log).
 *
 * Its only added responsibility is mapping VALIDATION (422) errors to form
 * fields via the `onValidationError` callback. VALIDATION errors are routed to
 * `toast: null` globally, so they never produce a global toast.
 */
export function useSafeMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(options: UseSafeMutationOptions<TData, TError, TVariables, TContext>) {
  const { onValidationError, ...rest } = options;

  return useMutation({
    ...rest,
    onError: (error) => {
      if (!onValidationError) return;

      const fields = mapApiValidationToForm(error);

      if (Object.keys(fields).length > 0) {
        onValidationError(fields);
      }
    },
  });
}
