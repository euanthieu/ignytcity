import { Redis } from "@upstash/redis";

let client: Redis | null = null;

/** Vercel's dashboard stores a cleared variable as "", not undefined — treat blank the same as absent. */
function read(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

/** Thrown when Upstash credentials are absent, so callers can tell config errors from network errors. */
export class UpstashNotConfiguredError extends Error {
  readonly missing: string[];

  constructor(missing: string[]) {
    super(`Upstash is not configured. Missing: ${missing.join(", ")}.`);
    this.name = "UpstashNotConfiguredError";
    this.missing = missing;
  }
}

/** Names of the vars that are absent or blank. Empty array means the credentials are present. */
export function missingUpstashVars(): string[] {
  return ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"].filter(
    (name) => !read(name),
  );
}

/**
 * Lazily constructed so a missing config doesn't crash the whole app at
 * import time — only requests that actually need order storage fail.
 */
export function getRedis(): Redis {
  if (client) return client;

  const missing = missingUpstashVars();
  if (missing.length > 0) {
    throw new UpstashNotConfiguredError(missing);
  }

  client = new Redis({
    url: read("UPSTASH_REDIS_REST_URL") as string,
    token: read("UPSTASH_REDIS_REST_TOKEN") as string,
  });
  return client;
}
