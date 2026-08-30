# API Error Kernel Guide (FAOS v4)

In a SaaS-grade frontend, error handling is not an afterthought — it is a deterministic pipeline. Every error flows through exactly one path:

```
HTTP Response → http.ts normalization → ApiError (kernel) → Error Router → UI Strategy
```

This guide defines the contract, the kernel, and the rules.

---

## 1. Error Contract (Backend Shape)

The backend must always return errors in this standardized JSON format. The frontend does not parse raw strings or HTML error pages.

```typescript
// Expected error payload from backend:
{
  message: string;              // Human-readable description
  code?: string;                // Machine-readable code (e.g., "VALIDATION_001")
  details?: Record<string, string[]>; // Field-level validation errors (422 only)
}
```

> **Rule**: If the backend does not follow this contract, it is a backend bug.

---

## 2. HTTP Layer (`http.ts` — Normalization Kernel)

`src/shared/lib/http.ts` is the single source of truth for all API failures. It:

1. Attempts to parse the JSON error payload.
2. **Classifies** the error into an `ErrorCategory`.
3. **Throws** a strongly typed `ApiError` — never a raw string.

```typescript
// src/shared/errors/api-error.ts
export type ErrorCategory =
  | "AUTH"
  | "FORBIDDEN"
  | "VALIDATION"
  | "NOT_FOUND"
  | "NETWORK"
  | "SERVER"
  | "UNKNOWN";

export class ApiError extends Error {
  category: ErrorCategory;
  status?: number;
  code?: string;
  details?: Record<string, string[]>;
}
```

**Classification table** (applied inside `http.ts`):

| HTTP Status | Category     |
| ----------- | ------------ |
| 401         | `AUTH`       |
| 403         | `FORBIDDEN`  |
| 404         | `NOT_FOUND`  |
| 422         | `VALIDATION` |
| 5xx         | `SERVER`     |
| Network err | `NETWORK`    |
| Other       | `UNKNOWN`    |

> **Rule**: No component or hook ever reads `res.status` directly. Classification happens once, in `http.ts`.

---

## 3. System Layer (Router + React Query Cache)

### Error Router (`src/shared/errors/error-router.ts`)

`routeError(error)` converts a classified `ApiError` into a **UI strategy decision**:

```typescript
switch (error.category) {
  case "AUTH":       → toast "Session expired" + dispatch logout event
  case "FORBIDDEN":  → toast "Access denied" + no further action
  case "VALIDATION": → no toast (form layer handles it)
  case "NETWORK":    → toast "Network connection issue" (retryable)
  default:           → toast error.message + log
}
```

### Retry Policy (`src/shared/errors/retry-policy.ts`)

React Query retries only when the error category permits it:

```typescript
// query-provider.tsx
retry: (count, error) => count < getRetryCount(error)

// getRetryCount:
NETWORK  → 3 retries
SERVER   → 2 retries
429      → 1 retry
AUTH/FORBIDDEN/VALIDATION → 0 retries
```

> **Rule**: React Query must never blindly retry. Retry decisions are owned by the retry policy engine.

### Telemetry (`src/shared/errors/use-error-telemetry.ts`)

`logError(error)` fires on every `ApiError` inside the React Query cache callbacks. This is the integration point for Sentry, Datadog, or OpenTelemetry.

```typescript
logError(error); // → console.log in dev, analytics in prod
```

---

## 4. UI Layer (Forms + Components)

### Form Validation (422 Errors)

`VALIDATION` errors bypass the global toast system entirely. The `mapApiValidationToForm` adapter maps structured field errors to your form library.

```typescript
// src/shared/errors/map-validation.ts
const fields = mapApiValidationToForm(error);

Object.entries(fields).forEach(([key, messages]) => {
  setError(key, { message: messages[0] });
});
```

> **Rule**: No mutation handler may directly read `error.details` — it must use `mapApiValidationToForm`.

### Component Error States

Use React Query's `error` state for inline UI recovery. Never add component-level `try/catch` for display logic.

```tsx
const { data, error } = useUsers();

if (error) {
  return (
    <div className="p-4 bg-red-50 text-red-600 rounded-md">
      <p>Error: {error.message}</p>
      <Button onClick={() => refetch()}>Try Again</Button>
    </div>
  );
}
```

### RBAC Gating (403 Errors)

The `<Can>` component prevents rendering privileged UI before a request is even made. A `FORBIDDEN` response at the API layer is a backup guard — not the primary mechanism.

```tsx
<Can permission="posts:create">
  <CreatePostButton />
</Can>
```

---

## 🚨 Golden Rules

1. **One normalization point**: All errors are classified inside `http.ts`. Nowhere else.
2. **One routing point**: All system-level decisions (toast, logout, retry) flow through `routeError`.
3. **No UI coupling**: Components never inspect `error.status` or `error.category` directly.
4. **Form errors bypass global**: `VALIDATION` category never triggers a toast.
5. **Retry is policy-driven**: React Query retries only when `getRetryCount` permits it.
