import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const maxAge = 5 * 60 * 1000;
  for (const [key, record] of memoryStore.entries()) {
    record.timestamps = record.timestamps.filter(ts => now - ts < maxAge);
    if (record.timestamps.length === 0) {
      memoryStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
  message?: string;
}

/**
 * High-performance sliding-window in-memory rate limiting middleware.
 * Prevents credential stuffing, DDoS, and API exhaustion without external dependencies.
 */
export function rateLimiter(options: RateLimiterOptions) {
  const {
    windowMs,
    maxRequests,
    keyPrefix = 'rl',
    message = 'Too many requests received from this client. Please retry later.'
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Whitelist health check
    if (req.path === '/api/health') {
      return next();
    }

    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${clientIp}`;
    const now = Date.now();

    let record = memoryStore.get(key);
    if (!record) {
      record = { timestamps: [] };
      memoryStore.set(key, record);
    }

    // Keep only timestamps within the active sliding window
    record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);

    if (record.timestamps.length >= maxRequests) {
      const oldest = record.timestamps[0];
      const retryAfterSec = Math.ceil((oldest + windowMs - now) / 1000);

      res.setHeader('Retry-After', String(Math.max(1, retryAfterSec)));
      res.setHeader('X-RateLimit-Limit', String(maxRequests));
      res.setHeader('X-RateLimit-Remaining', '0');

      return res.status(429).json({
        error: message,
        statusCode: 429,
        retryAfterSeconds: Math.max(1, retryAfterSec)
      });
    }

    record.timestamps.push(now);
    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(maxRequests - record.timestamps.length));

    next();
  };
}
