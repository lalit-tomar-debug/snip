import { createClient } from 'redis';

let client = null;
const TTL_SECONDS = 60 * 60 * 24; // cached links expire after 24 hours

// Redis is optional: if it is missing, the app still works using MongoDB only.
export async function connectRedis() {
  if (!process.env.REDIS_URL) {
    console.log('Redis off (no REDIS_URL). Using MongoDB only.');
    return;
  }
  try {
    const c = createClient({
      url: process.env.REDIS_URL,
      socket: { reconnectStrategy: false },
    });
    c.on('error', () => {});
    await c.connect();
    client = c;
    console.log('Redis connected');
  } catch {
    console.log('Redis not reachable. Using MongoDB only.');
  }
}

export async function cacheGet(code) {
  try { return client ? await client.get(`url:${code}`) : null; } catch { return null; }
}
export async function cacheSet(code, url) {
  try { if (client) await client.set(`url:${code}`, url, { EX: TTL_SECONDS }); } catch {}
}
export async function cacheDel(code) {
  try { if (client) await client.del(`url:${code}`); } catch {}
}
