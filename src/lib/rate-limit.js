/**
 * In-memory sliding-window rate limiter.
 * Each call to rateLimit() returns an independent limiter instance.
 *
 * Usage:
 *   const limiter = rateLimit({ interval: 60_000, maxRequests: 10 });
 *   const { allowed, remaining } = limiter.check(ip);
 */

const CLEANUP_INTERVAL = 60_000; // prune stale entries every 60s

export function rateLimit({ interval, maxRequests }) {
    const tokens = new Map(); // ip -> [timestamp, timestamp, ...]

    // Periodic cleanup of entries that have no recent timestamps
    let lastCleanup = Date.now();

    function cleanup(now) {
        if (now - lastCleanup < CLEANUP_INTERVAL) return;
        lastCleanup = now;
        for (const [key, timestamps] of tokens) {
            const valid = timestamps.filter(t => now - t < interval);
            if (valid.length === 0) {
                tokens.delete(key);
            } else {
                tokens.set(key, valid);
            }
        }
    }

    function check(ip) {
        const now = Date.now();
        cleanup(now);

        const timestamps = tokens.get(ip) || [];
        const valid = timestamps.filter(t => now - t < interval);

        if (valid.length >= maxRequests) {
            tokens.set(ip, valid);
            return { allowed: false, remaining: 0 };
        }

        valid.push(now);
        tokens.set(ip, valid);
        return { allowed: true, remaining: maxRequests - valid.length };
    }

    return { check };
}
