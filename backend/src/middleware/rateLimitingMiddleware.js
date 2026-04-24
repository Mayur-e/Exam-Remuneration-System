/**
 * Advanced Rate Limiting Middleware
 * 
 * Implements multiple rate limiting strategies:
 * - Global IP-based limits
 * - Endpoint-specific limits
 * - User-based limits (authenticated users get higher limits)
 * - Login endpoint protection (strict limits for brute-force prevention)
 * - Custom exemptions for trusted sources
 */

const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const redis = require("redis");

/**
 * Determine if Redis is available for distributed rate limiting
 * Falls back to in-memory store if Redis is not available
 */
const getStore = () => {
  if (process.env.REDIS_URL) {
    try {
      const client = redis.createClient({ url: process.env.REDIS_URL });
      client.connect();
      return new RedisStore({
        client: client,
        prefix: "rate-limit:",
      });
    } catch (err) {
      console.warn("Redis connection failed, falling back to in-memory store");
    }
  }
  return undefined; // Falls back to default in-memory store
};

/**
 * Global rate limiter for all API routes
 * - 100 requests per 15 minutes per IP
 * - Applies to all /api/* routes
 * - Returns proper 429 status with retry-after header
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes"
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the deprecated `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    if (req.path === "/") return true;
    // Skip for public config endpoint
    if (req.path === "/api/config") return true;
    return false;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
      retryAfter: req.rateLimit.resetTime
        ? new Date(req.rateLimit.resetTime).toISOString()
        : "unknown"
    });
  },
  store: getStore(),
  keyGenerator: (req) => {
    // Use X-Forwarded-For if available (for proxy/load balancer scenarios)
    return req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  }
});

/**
 * Strict rate limiter for login endpoint
 * - 5 requests per 15 minutes per IP
 * - Prevents brute-force attacks on authentication
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts per 15 minutes
  message: {
    success: false,
    message: "Too many login attempts. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method !== "POST",
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many login attempts. Please try again later.",
      retryAfter: req.rateLimit.resetTime
        ? new Date(req.rateLimit.resetTime).toISOString()
        : "unknown"
    });
  },
  store: getStore(),
  keyGenerator: (req) => {
    return req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  }
});

/**
 * User-aware rate limiter for authenticated users
 * - Authenticated users get 1000 requests per 15 minutes
 * - Unauthenticated users get 100 requests per 15 minutes
 * - Allows higher-volume programmatic access for legitimate users
 */
const userAwareLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Authenticated users get 10x more requests
    if (req.user) {
      return 1000;
    }
    return 100;
  },
  message: {
    success: false,
    message: "Rate limit exceeded. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip for public endpoints
    if (req.path === "/" || req.path === "/api/config") return true;
    return false;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Rate limit exceeded. Please try again later.",
      retryAfter: req.rateLimit.resetTime
        ? new Date(req.rateLimit.resetTime).toISOString()
        : "unknown"
    });
  },
  store: getStore(),
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise use IP
    if (req.user && req.user.id) {
      return `user:${req.user.id}`;
    }
    return req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  }
});

/**
 * Strict rate limiter for sensitive operations
 * - File uploads, password changes, etc.
 * - 10 requests per hour per user
 */
const sensitiveOperationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    message: "Too many requests for this operation. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests for this sensitive operation.",
      retryAfter: req.rateLimit.resetTime
        ? new Date(req.rateLimit.resetTime).toISOString()
        : "unknown"
    });
  },
  store: getStore(),
  keyGenerator: (req) => {
    // Always use user ID for authenticated endpoints
    if (req.user && req.user.id) {
      return `sensitive:${req.user.id}`;
    }
    return req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  }
});

/**
 * Export all limiters
 * Usage:
 * - globalLimiter: Apply to all /api routes
 * - loginLimiter: Apply to POST /api/auth/login
 * - userAwareLimiter: Apply to authenticated endpoints
 * - sensitiveOperationLimiter: Apply to file uploads, password changes, etc.
 */
module.exports = {
  globalLimiter,
  loginLimiter,
  userAwareLimiter,
  sensitiveOperationLimiter
};
