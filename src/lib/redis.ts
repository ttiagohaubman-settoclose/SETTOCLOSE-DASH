import { Redis } from "@upstash/redis";

let redis: Redis;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: (process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL)!,
      token: (process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN)!,
    });
  }
  return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await getRedis().get<T>(key);
    return data;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<void> {
  try {
    const ttl = ttlSeconds ?? Number(process.env.CACHE_TTL ?? 300);
    await getRedis().set(key, value, { ex: ttl });
  } catch {
    // fail silently — cache is best effort
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await getRedis().del(key);
  } catch {
    // fail silently
  }
}

export async function redisGet<T>(key: string): Promise<T | null> {
  return getRedis().get<T>(key);
}

export async function redisSet(key: string, value: unknown): Promise<void> {
  await getRedis().set(key, value);
}

export async function redisDel(key: string): Promise<void> {
  await getRedis().del(key);
}

export async function redisKeys(pattern: string): Promise<string[]> {
  return getRedis().keys(pattern);
}
