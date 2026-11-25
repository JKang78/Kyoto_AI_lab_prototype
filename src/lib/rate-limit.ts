/**
 * Fixed-window request limiter kept in server memory. It is per server instance and resets on restart,
 * which is enough to stop one client from looping the paid model in this prototype. A deployment with
 * several instances needs a shared store (which would require approval for new infrastructure).
 */
export interface RateLimiter {
  /** Records one request for `key` at `now` (ms) and reports whether it is within the limit. */
  take(key: string, now?: number): { allowed: boolean; retryAfterSeconds: number };
}

export function createRateLimiter({ limit, windowMs, maxKeys = 5000 }: { limit: number; windowMs: number; maxKeys?: number }): RateLimiter {
  const windows = new Map<string, { start: number; count: number }>();
  return {
    take(key, now = Date.now()) {
      const current = windows.get(key);
      if (!current || now - current.start >= windowMs) {
        if (windows.size >= maxKeys) {
          // Drop expired windows first; if every key is still active, drop the oldest one.
          for (const [storedKey, value] of windows) if (now - value.start >= windowMs) windows.delete(storedKey);
          if (windows.size >= maxKeys) windows.delete(windows.keys().next().value as string);
        }
        windows.set(key, { start: now, count: 1 });
        return { allowed: true, retryAfterSeconds: 0 };
      }
      current.count += 1;
      const retryAfterSeconds = Math.max(1, Math.ceil((current.start + windowMs - now) / 1000));
      return current.count <= limit ? { allowed: true, retryAfterSeconds: 0 } : { allowed: false, retryAfterSeconds };
    },
  };
}

/** The client address from proxy headers, used only as an in-memory limiter key and never stored or logged. */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}
