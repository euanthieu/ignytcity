# Setup Guide: Clone → Development → Production

This guide covers the complete lifecycle of working with this template — from first-time setup through to a live production deployment.

---

## 📋 Prerequisites

Install these once on your machine:

| Tool        | Version | Install                                     |
| ----------- | ------- | ------------------------------------------- |
| **Node.js** | v20+    | [nodejs.org](https://nodejs.org/) — use LTS |
| **pnpm**    | v9+     | `npm install -g pnpm`                       |
| **Git**     | any     | [git-scm.com](https://git-scm.com/)         |

Verify your setup:

```bash
node --version    # v20.x.x
pnpm --version    # 9.x.x
git --version     # git version 2.x.x
```

---

## 1️⃣ Clone

```bash
# Clone the repository
git clone https://github.com/rmValdez/next-template-v1.git

# Enter the project directory
cd next-template-v1
```

---

## 2️⃣ Install Dependencies

```bash
pnpm install
```

This single command:

- Installs all **production** and **dev** dependencies
- Automatically runs `husky` to set up git hooks (`pre-commit`, `commit-msg`)
- Is **~3× faster** and uses far less disk space than `npm install` thanks to pnpm's content-addressable store

> **Note**: Never use `npm install` or `yarn install` — this project uses pnpm and has a `pnpm-lock.yaml`. Mixing package managers corrupts the lockfile.

---

## 3️⃣ Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env.local
```

Open `.env.local` and fill in your values:

```env
# ── Required ──────────────────────────────────────────────────────────
# Your backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# ── Optional ──────────────────────────────────────────────────────────
# Canonical frontend URL (used for OG tags, sitemap)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Runtime environment (drives feature flag defaults)
NEXT_PUBLIC_APP_ENV=development
```

> **How validation works**: `src/shared/lib/env.ts` validates all env vars using Zod on startup.
> If `NEXT_PUBLIC_API_URL` is missing or malformed, the app **throws immediately** instead of silently failing at the API call.

---

## 4️⃣ Development

Start the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The dev server supports:

- ⚡ **Turbopack** — fast HMR
- 🔥 **Hot reload** for all files including server components

### Useful dev commands

```bash
pnpm test:watch       # Vitest in watch mode — runs tests on file save
pnpm storybook        # Component explorer at http://localhost:6006
pnpm lint             # ESLint with FAOS boundary rules
pnpm type-check       # TypeScript type check (no emit)
pnpm validate         # FAOS architecture validator — catches illegal imports
```

### Before every commit

The `pre-commit` hook does this automatically, but you can run it manually too:

```bash
pnpm lint             # must pass
pnpm type-check       # must pass
pnpm validate         # must pass
pnpm test             # must pass
```

Commits that fail these checks are **blocked by the git hook**.

---

## 5️⃣ Quality Gates (Local → CI)

Every change passes through layered gates:

```
┌─────────────────── Local ───────────────────────┐
│  git commit                                      │
│    └── pre-commit hook                           │
│          └── lint-staged (ESLint + Prettier)     │
│    └── commit-msg hook                           │
│          └── commitlint (Conventional Commits)   │
└──────────────────────────────────────────────────┘
              ↓ git push
┌─────────────────── CI ──────────────────────────┐
│  GitHub Actions (.github/workflows/deploy-ecr.yml)│
│    1. pnpm install (cached)                      │
│    2. pnpm type-check                            │
│    3. pnpm lint                                  │
│    4. pnpm test       (Vitest tests)             │
│    5. pnpm build      (Next.js standalone build) │
│    6. Docker Build & Push to AWS ECR             │
└──────────────────────────────────────────────────┘
              ↓ Auto-Deployed
┌─────────────────── Environments ────────────────┐
│  AWS Elastic Container Registry (ECR)            │
│    - Tagged by commit SHA & latest               │
└──────────────────────────────────────────────────┘
```

---

## 6️⃣ Building for Production

Test the production build locally before deploying:

```bash
# Build
pnpm build

# Preview the production build locally
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) — this is the exact build that the Docker container will serve.

Common build issues:
| Error | Cause | Fix |
|---|---|---|
| `Missing NEXT_PUBLIC_API_URL` | env var not set | Set in `.env.local` or container env variables |
| TypeScript errors | Type issues | Run `pnpm type-check` and fix all errors |
| ESLint errors | Boundary violation | Run `pnpm lint` and fix |
| Build size warning | Large bundle | Run `pnpm analyze` to inspect |

---

## 7️⃣ Deploy to AWS ECR (Production)

This template builds a standalone Next.js Docker image and pushes it to AWS ECR automatically via GitHub Actions.

### Prerequisites

1. Set up an AWS IAM Role configured for GitHub Actions OIDC.
2. Create an AWS ECR Repository named `my-next-app` (or change the name in `.github/workflows/deploy-ecr.yml`).

### CI/CD Deployment

1. Update `.github/workflows/deploy-ecr.yml` with your exact AWS Region and IAM Role ARN.
2. Push your changes to the `main` branch.

From this point on, every push to `main` will:
- Run all quality gates (linting, type-checking, tests).
- Build the optimized Docker image.
- Tag and push the image to AWS ECR.

You can then hook this ECR repository up to AWS ECS (Fargate), AWS App Runner, or Kubernetes for serving traffic.

---

## 8️⃣ Environment Variables by Stage

| Variable               | Development             | Staging                           | Production                |
| ---------------------- | ----------------------- | --------------------------------- | ------------------------- |
| `NEXT_PUBLIC_API_URL`  | `http://localhost:3001` | `https://api.staging.yourapp.com` | `https://api.yourapp.com` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://staging.yourapp.com`     | `https://yourapp.com`     |
| `NEXT_PUBLIC_APP_ENV`  | `development`           | `staging`                         | `production`              |

When deploying the Docker container, pass these environment variables at runtime to your container via AWS ECS Task Definitions, App Runner configuration, or Kubernetes ConfigMaps.

---

## 9️⃣ Adding a New Feature (Quick Reference)

Follow these 5 steps every time:

```bash
# 1. Create the folder
mkdir -p src/features/my-feature/{api,contracts,hooks,components}

# 2. Write the Zod contract
touch src/features/my-feature/contracts/my-feature.contract.ts

# 3. Write the API client
touch src/features/my-feature/api/my-feature.client.ts
touch src/features/my-feature/api/my-feature.keys.ts

# 4. Write the hooks
touch src/features/my-feature/hooks/useMyFeature.ts

# 5. Add the manifest
touch src/features/my-feature/feature.manifest.ts
```

Then add ESLint boundary rules in `eslint.config.mjs` and run `pnpm validate` to confirm boundaries are clean.

See [beginner-guide.md](./beginner-guide.md) for a detailed walkthrough.

---

## 🆘 Common Issues

### `pnpm` not found

```bash
npm install -g pnpm
```

### Port 3000 already in use

```bash
pnpm dev -- -p 3001   # run on a different port
```

### Husky hooks not running

```bash
pnpm install          # re-runs the prepare script which initializes husky
```

### `NEXT_PUBLIC_API_URL` validation error on startup

Ensure `.env.local` exists and contains a valid URL (including `http://` or `https://`).

### Architecture validator fails

```bash
pnpm validate         # shows which file has the illegal import
```

Fix the import shown in the error — cross-feature imports are never allowed.
