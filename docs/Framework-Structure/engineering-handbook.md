# Engineering Handbook

This handbook serves as the definitive source of truth for the architectural boundaries, design patterns, and philosophies of this SaaS-Grade Next.js Frontend Template. All engineers working on this codebase must adhere to these rules.

## 1. Architectural Philosophy

This project is an **API-Driven Frontend Shell**. It does not own backend logic.

- **Predictability over abstraction**: Code should be easy to trace without relying on hidden wrapper logic.
- **Composition over complexity**: Favor small, reusable React hooks and components over bloated "god objects."
- **Native Web APIs**: Use native `fetch` over heavy third-party wrappers like Axios or Apisauce.
- **Frontend-Only Authority**: The frontend strictly tracks and manifests session state. True security, refresh logic, and user validation are owned completely by the external API backend.

## 2. The Feature-Based Architecture

The `src/` directory is strictly divided into three distinct layers to prevent spaghetti code.

### `app/` (The Dumb Layer)

The Next.js App Router layer is responsible **only** for mapping URLs to features and establishing layouts.

- **Rule**: `app/` pages cannot contain complex business logic or raw API fetches. They must import cleanly encapsulated views from the `features/` layer. The app layer must only compose features, never implement logic.

### `features/` (The Business Domains)

Features encapsulate specific domains of the application (e.g., `auth/`, `users/`). Each feature folder contains its own `api/`, `components/`, `hooks/`, and `stores/`.

- **Rule**: **Strict Feature Isolation**. Files inside `src/features/A` cannot import from `src/features/B`. Features can only communicate with each other by composing them at the `app/` level, or by sharing data via the `shared/` layer. This is actively enforced by ESLint.

### `shared/` (The Global Infrastructure)

Generic logic, global UI components (like Buttons or Skeletons), and global stores go here.

- **Rule**: Shared logic must have zero knowledge of any specific business domain. It must be highly generic. `shared/` must never import from `features/` or `app/`.

## 3. Data Flow & State Management

**Rule: React Query owns Server State. Zustand owns UI State.**

1. **Server State (API Data)**: Must only be fetched, cached, and synced using `@tanstack/react-query`. Components should never store raw API responses in `useState` or `Zustand`.
2. **UI State**: Things like sidebar toggles, dark mode, or modal visibility are managed by `Zustand`.
3. **Data Fetching Pipeline**:
   `Component` → `useSafeQuery / useSafeMutation` → `Feature Hook (useUsers)` → `Feature Client (users.client.ts)` → `http.ts` → `Backend API`
4. **Query Keys**: Every feature must use a key factory (e.g., `usersKeys.lists()`). Raw string keys are forbidden.

## 4. Error Handling Protocol

We use a deterministic 3-layer error pipeline. Components never decide error meaning.

```
http.ts → ApiError (normalized + classified)
       → error-router (toast | logout | form | retry)
       → query-provider (global execution boundary)
       → feature layer (form binding, UI retry)
```

- **`http.ts`**: Classifies every non-2xx response into an `ErrorCategory` (`AUTH`, `FORBIDDEN`, `VALIDATION`, `NOT_FOUND`, `SERVER`, `NETWORK`). Throws a typed `ApiError`. Never a raw string.
- **`error-router.ts`**: Maps `ErrorCategory` to a UI strategy. `VALIDATION` errors bypass the toast entirely and route to `mapApiValidationToForm`.
- **`retry-policy.ts`**: Determines retry count per category. React Query must not retry `AUTH` or `FORBIDDEN` errors.
- **`useSafeQuery`**: Applies retry policy automatically. Drop-in replacement for `useQuery`.
- **`useSafeMutation`**: Routes errors through the error-router and calls `onValidationError` for form binding. Drop-in replacement for `useMutation`.

## 5. Auth Client Adapter Layer

We treat Authentication as an external service. This template provides an **Auth Client Adapter**.

- We **do not** use heavy frameworks like NextAuth.js unless OAuth is explicitly required.
- We **do not** implement backend session logic (like rotating refresh tokens automatically), as this is an architecture decision belonging to the specific backend service.
- We **do** store authentication token as provided by backend (storage method depends on implementation: memory, cookie, or localStorage) and attach it to outgoing requests. We track whether the user is logically logged in via our UI store (`auth.store.ts`), driving UI and route-based rendering states.

## 6. Code Style & Tooling

- **Imports**: Absolute imports are strictly enforced. Use `@/app`, `@/features`, and `@/shared`. Never use generic `@/` or deep relative `../../` imports that cross boundaries.
- **Linting**: `pnpm lint` enforces boundary rules via `eslint.config.mjs` (per-layer `no-restricted-imports`).
- **Architecture Validator**: `pnpm validate` runs `tools/validate-architecture.mjs` — a static import-boundary scanner that blocks cross-feature imports and manifest pollution. **Must pass in CI before build.**
- **TypeScript**: `pnpm type-check` is the definitive compile-time check. Never silence type errors with `as any`.
- **Naming**: API files follow `*.client.ts`. Hooks follow `use*.ts`. Components are `PascalCase`. Key factories follow `featureKeys.action()` pattern.
- **Testing**: `pnpm test` runs the Vitest suite. All new features must include unit tests in `__tests__/` directories.
- **Package Manager**: Always use `pnpm`. Never run `npm install` or `yarn` — it will corrupt `pnpm-lock.yaml`.

## 7. API Contract Standard

All API responses are external contracts and must be treated as unstable.

- **Rule**: Every feature's `*.client.ts` MUST validate responses against a Zod schema in `features/*/contracts/`.
- **Rule**: Types MUST be derived from Zod schemas (`z.infer<typeof Schema>`), not declared independently.
- **Rule**: A Zod parse error = a backend contract violation. It is a backend bug, not a frontend catch.

```ts
// Correct — in users.client.ts
const raw = await fetcher<unknown>("/api/users");
return UsersResponseSchema.parse(raw); // throws ZodError if backend drifts
```

## 8. FAOS System Primitives

This architecture is powered by deterministic, non-runtime system primitives.

### 🔐 8.1 RBAC (Role-Based Access Control)

- **Rule**: `shared/auth/rbac.ts` is the sole source of truth for permission logic. UI must gate via `<Can permission="posts:create">` or `usePermissions().can()`. Never hardcode role checks in components.

### 🚩 8.2 Feature Flags

- **Rule**: `shared/flags/` controls UI composition only. Flags must never affect API logic. Use `useFeatureFlag("FLAG_KEY")` in components.

### 📄 8.3 Pagination Standard

- **Rule**: All paginated endpoints MUST return `PaginatedResponse<T>`. All paginated lists MUST use `usePagination()`, which binds page state to URL search params — never to Zustand.

### ⚡ 8.4 Query Wrappers

- **Rule**: Feature hooks MUST use `useSafeQuery` instead of `useQuery` and `useSafeMutation` instead of `useMutation`. Direct React Query imports in feature hooks are forbidden.

## 9. FAOS v5 — Build-Time Enforcement Layer

The final enforcement layer operates at build time, not runtime.

### 9.1 feature.manifest.ts

Every feature MUST declare a `feature.manifest.ts`:

```ts
export const featureManifest = {
  name: "users",
  dependsOn: ["auth"], // CI validates these exist
  exposes: ["useUsers"], // public API surface
} as const;
```

- ❌ Never import `feature.manifest.ts` into the React tree.
- ✅ CI-only artifact consumed by `validate-architecture.mjs`.

### 9.2 Architecture Validator (`pnpm validate`)

`tools/validate-architecture.mjs` is a static import-boundary scanner (regex-based
import extraction, not a full AST) that enforces:

| Rule                  | What it catches                                           |
| --------------------- | --------------------------------------------------------- |
| Cross-feature imports | `features/A` importing from `features/B`                  |
| `shared/` purity      | `shared/` importing `features/` or `app/`                 |
| `app/` discipline     | `app/` importing `@tanstack/react-query` directly         |
| Import strategy       | Deep relative imports (`../../`) instead of `@/*` aliases |
| Manifest pollution    | `feature.manifest.ts` imported into the runtime tree      |

```bash
pnpm validate  # exit 0 = clean, exit 1 = build blocked
```
