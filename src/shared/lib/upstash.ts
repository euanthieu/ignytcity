import { Redis } from "@upstash/redis";

let client: Redis | null = null;

/**
 * Lazily constructed so a missing config doesn't crash the whole app at
 * import time — only requests that actually need order storage fail.
 */
export function getRedis(): Redis {
  if (client) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Upstash is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
    );
  }

  client = new Redis({ url, token });
  return client;
}
