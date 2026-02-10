import type { RateLimitConfig, RateLimitResult, RateLimiter } from '@/types';

const CLEANUP_INTERVAL = 60_000;

export function rateLimit({ interval, maxRequests }: RateLimitConfig): RateLimiter {
    const tokens = new Map<string, number[]>();
    let lastCleanup = Date.now();

    function cleanup(now: number): void {
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

    function check(ip: string): RateLimitResult {
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
