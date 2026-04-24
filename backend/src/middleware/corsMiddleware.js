/**
 * Secure CORS Configuration Middleware
 * 
 * Implements environment-specific, production-grade CORS policies.
 * - Strict whitelist-based approach
 * - No wildcards for authenticated routes
 * - Environment-specific configuration
 * - Proper credential handling
 */

const cors = require("cors");

/**
 * Parse origin configuration from environment variable
 * 
 * Expected format: CORS_ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com,http://localhost:3000
 * 
 * @returns {Array<string|RegExp>} Array of allowed origins
 */
const getAllowedOrigins = () => {
  const defaultOrigins = {
    development: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000"
    ],
    staging: [],
    production: []
  };

  const env = process.env.NODE_ENV || "development";
  let origins = defaultOrigins[env] || defaultOrigins.development;

  // Add environment-specific origins from CORS_ALLOWED_ORIGINS
  if (process.env.CORS_ALLOWED_ORIGINS) {
    const envOrigins = process.env.CORS_ALLOWED_ORIGINS.split(",")
      .map(o => o.trim())
      .filter(o => o);
    origins = [...origins, ...envOrigins];
  }

  // Add frontend URL if specified
  if (process.env.FRONTEND_URL) {
    origins = [...origins, process.env.FRONTEND_URL];
  }

  if (origins.length === 0) {
    throw new Error(
      "No CORS origins configured. Set CORS_ALLOWED_ORIGINS or FRONTEND_URL environment variables."
    );
  }

  return origins;
};

/**
 * Get CORS options based on route type and authentication
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.requireAuth - If true, applies strict CORS for authenticated routes
 * @param {boolean} options.allowCredentials - Whether to allow credentials
 * @returns {Object} CORS configuration object
 */
const getCorsOptions = (options = {}) => {
  const {
    requireAuth = false,
    allowCredentials = true,
    allowPublicOrigins = false
  } = options;

  const allowedOrigins = getAllowedOrigins();

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl requests, Postman)
      // ONLY for non-authenticated routes or development
      if (!origin) {
        if (process.env.NODE_ENV === "development" && !requireAuth) {
          return callback(null, true);
        }
        // In production, require authenticated routes to have an origin
        if (requireAuth) {
          return callback(new Error("CORS: Origin required for this endpoint"));
        }
        return callback(null, false);
      }

      // Check if origin is in whitelist
      const isAllowed = allowedOrigins.some(allowed => {
        if (typeof allowed === "string") {
          return allowed === origin;
        }
        // For regex patterns
        return allowed.test(origin);
      });

      if (isAllowed) {
        return callback(null, true);
      }

      // Allow public origins only for non-authenticated routes
      if (allowPublicOrigins && !requireAuth) {
        // Could add additional validation here for specific public endpoints
        return callback(null, true);
      }

      // Reject disallowed origins
      const error = new Error(`CORS: Origin "${origin}" is not allowed`);
      console.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
      callback(error);
    },

    // Allow specific HTTP methods
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

    // Allow specific headers
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Accept-Language",
      "X-CSRF-Token"
    ],

    // Expose these headers to the client
    exposedHeaders: [
      "X-Total-Count", // For pagination
      "RateLimit-Limit",
      "RateLimit-Remaining",
      "RateLimit-Reset",
      "Retry-After"
    ],

    // Allow cookies/credentials to be sent with cross-origin requests
    credentials: allowCredentials,

    // Cache preflight requests for 24 hours (in seconds)
    maxAge: 86400,

    // Enable CORS for all requests by default
    preflightContinue: false,

    // Override default success status for OPTIONS requests
    optionsSuccessStatus: 200
  };
};

/**
 * Create CORS middleware
 * 
 * @param {Object} options - Configuration options
 * @returns {Function} CORS middleware function
 */
const createCorsMiddleware = (options = {}) => {
  return cors(getCorsOptions(options));
};

/**
 * Middleware to log CORS-related information (useful for debugging)
 * Add this after CORS middleware to see what's being allowed
 */
const corsDebugMiddleware = (req, res, next) => {
  if (process.env.DEBUG_CORS === "true") {
    console.log(`[CORS Debug] ${req.method} ${req.path} from origin: ${req.headers.origin || "no-origin"}`);
  }
  next();
};

module.exports = {
  createCorsMiddleware,
  corsDebugMiddleware,
  getCorsOptions,
  getAllowedOrigins
};
