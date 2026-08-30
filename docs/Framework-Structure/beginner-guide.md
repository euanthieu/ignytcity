# Beginner's Guide: Building a Feature

Welcome to the team! This guide will walk you through building your very first feature in this architecture.

Our architecture is strict, but that strictness makes your job easier. You never have to guess _where_ code goes. Let's build a simple "Products" feature.

> 💡 **Tip**: The `posts` and `dashboard` features in this template are complete reference implementations you can copy from. This guide shows the same pattern from scratch.

## Step 1: Create the Feature Folder

Everything about a domain belongs in its own folder inside `src/features/`.
**Feature Ownership Rule**: Each feature is fully responsible for its API layer, hooks, components, and types. No other feature or shared code should define business logic for it.

Create a new directory for posts:

```bash
src/features/posts/
```

Inside this folder, create the standard structure:

```text
src/features/posts/
├── api/             # Where we talk to the backend
├── hooks/           # Where we connect API to React
├── components/      # The UI components for posts
└── types.ts         # TypeScript interfaces
```

## Step 2: Define Your Contract (Zod Schema)

Always start by defining what your data looks like — **using a Zod schema, not a plain interface**. Types are derived from the schema, making them runtime-safe.

Create `src/features/posts/contracts/posts.contract.ts`:

```typescript
import { z } from "zod";

export const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
});

export const PostsResponseSchema = z.array(PostSchema);

export type Post = z.infer<typeof PostSchema>;
```

> **Why Zod?** TypeScript types are compile-time only. If the backend silently changes the response shape, TypeScript won't catch it at runtime — Zod will.

## Step 3: Write the API Service

Next, we need a way to fetch the data. We **never** call `fetch` directly in UI components. Instead, we use the `http` client from `shared` and **validate the response against our Zod contract**.

Create `src/features/posts/api/posts.client.ts`:

```typescript
import { fetcher } from "@/shared/lib/http";
import { PostsResponseSchema } from "../contracts/posts.contract";

export const getPosts = async () => {
  const raw = await fetcher<unknown>("/api/posts");
  return PostsResponseSchema.parse(raw); // throws ZodError if backend drifts
};
```

Also create `src/features/posts/api/posts.keys.ts` for the query key factory:

```typescript
export const postsKeys = {
  all: ["posts"] as const,
  lists: () => [...postsKeys.all, "list"] as const,
  detail: (id: string) => [...postsKeys.all, "detail", id] as const,
};
```

};

````

## Step 4: Create the React Query Hook

React Query handles caching, loading states, and background updates. Use `useSafeQuery` — our drop-in wrapper that applies retry policy automatically.

Create `src/features/posts/hooks/usePosts.ts`:

```typescript
import { useSafeQuery } from "@/shared/query/useSafeQuery";
import { getPosts } from "../api/posts.client";
import { postsKeys } from "../api/posts.keys";

export function usePosts() {
  return useSafeQuery({
    queryKey: postsKeys.lists(),
    queryFn: getPosts,
  });
}
````

> **Rule**: Always use `useSafeQuery` instead of raw `useQuery`. Never hardcode query keys — always use the feature's key factory.

## Step 5: Build the UI Component

Now we can consume our data safely. Since we use React Query, we don't need `useEffect` or `useState` to fetch data!

Create `src/features/posts/components/PostList.tsx`:

```tsx
import { usePosts } from "../hooks/usePosts";
import { Skeleton } from "@/shared/components/Skeleton";

export function PostList() {
  const { data: posts, isLoading, error } = usePosts();

  // 1. Handle Loading (Use skeletons for visual continuity when UI structure is known. Use early returns when layout is unknown or data-dependent)
  if (isLoading) return <Skeleton className="h-32 w-full" />;

  // 2. Handle Errors (Errors should be treated as "UI states emitted by the data layer", not exceptions handled locally)
  if (error) return <div className="text-red-500">Failed to load posts.</div>;

  // 3. Render Data
  return (
    <div className="space-y-4">
      {posts?.map((post) => (
        <div key={post.id} className="p-4 border rounded shadow-sm">
          <h2 className="font-bold">{post.title}</h2>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
}
```

## Step 6: Display it in the App Layer

Finally, we need to show our feature on a page. The `src/app/` layer is "dumb"—it only mounts components from `features/` or `shared/`.

Open `src/app/page.tsx` and import your new feature:

```tsx
import { PostList } from "@/features/posts/components/PostList";

export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Latest Posts</h1>
      <PostList />
    </main>
  );
}
```

---

## 🎯 Important Rules to Remember

1. **No direct fetching in UI**: Always put your API calls in `features/*/api/*.client.ts`.
2. **Absolute Imports Only**: Always use `@/features/` or `@/shared/`. Never use `../../` relative paths crossing layers.
3. **No Cross-Feature Imports**: `features/posts/` cannot import from `features/users/`. If they need to share something, it belongs in `shared/`.
4. **Data Ownership**: React Query owns server state. Components must never persist API data into local state unless transforming it for UI purposes.
5. **Naming Consistency**: API files follow `*.client.ts`. Hooks follow `useX.ts`. Components are `PascalCase`. Key factories follow `featureKeys.action()` pattern.
6. **Query Wrappers**: Always use `useSafeQuery` (not `useQuery`) and `useSafeMutation` (not `useMutation`).
7. **Query Key Factory**: Each feature owns a `*.keys.ts` file. Never pass raw string arrays as query keys.
8. **Mutation Rule**: All mutations must live in `features/*/api` and be called via `useSafeMutation` — never directly inside components.
9. **Zod Contracts**: API responses MUST be validated with a Zod schema in `features/*/contracts/`. Types are derived from schemas, not declared separately.
10. **Feature Manifest**: Every new feature must include a `feature.manifest.ts` declaring its name, dependencies, and public surface.

---

## 🧠 Mental Model (How to Think)

A feature is a self-contained "mini application" that consumes external data and renders UI based on it.

Every feature has:

- **input** (API)
- **transformation** (hooks)
- **output** (components)

Everything else is a consequence of these three parts.

### System Primitives

The FAOS provides these global primitives — use them everywhere:

| Primitive                  | What it does     | How to use                                                    |
| -------------------------- | ---------------- | ------------------------------------------------------------- |
| **RBAC**                   | Who can do what  | `<Can permission="posts:create">` or `usePermissions().can()` |
| **Feature Flags**          | What UI exists   | `useFeatureFlag("NEW_DASHBOARD")`                             |
| **Pagination**             | How lists scale  | `usePagination()` — state lives in URL, not Zustand           |
| **Error Kernel**           | How errors flow  | Automatic via `useSafeQuery` / `useSafeMutation`              |
| **Zod Contracts**          | API safety net   | `Schema.parse(raw)` in every `*.client.ts`                    |
| **Architecture Validator** | Build-time guard | `pnpm validate` — blocks bad imports in CI                    |

You are now ready to build! 🚀

---

> 📖 **Next**: Read the [Engineering Handbook](./engineering-handbook.md) for the full rules, or the [Getting Started guide](./getting-started.md) for the clone → production workflow.
