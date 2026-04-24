/**
 * Enhanced Authentication Middleware
 * 
 * Secure token validation with additional checks:
 * - JWT token extraction from headers and query params
 * - Token signature verification
 * - User status validation
 * - Token expiration checks
 * - Audit logging
 */

const jwt = require("jsonwebtoken");
const pool = require("../config/db");

/**
 * Create an enhanced authentication middleware
 * 
 * @param {Object} options - Middleware options
 * @param {boolean} options.allowQueryToken - Allow token in query params (for file downloads)
 * @param {boolean} options.auditLog - Enable audit logging
 * @returns {Function} Express middleware
 */
const createAuthMiddleware = (options = {}) => {
  const { allowQueryToken = true, auditLog = true } = options;

  return async (req, res, next) => {
    try {
      let token;
      const authHeader = req.headers.authorization;

      // Extract token from Authorization header (preferred method)
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
      // Fallback: Allow token in query params for file downloads/previews
      else if (allowQueryToken && req.query.token) {
        token = req.query.token;
      }

      // No token provided
      if (!token) {
        if (auditLog) {
          console.warn(`[AUTH] No token provided for ${req.method} ${req.path}`);
        }
        return res.status(401).json({
          success: false,
          message: "Authentication required. No token provided.",
          code: "NO_TOKEN"
        });
      }

      // Verify JWT signature and expiration
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
      } catch (err) {
        if (err.name === "TokenExpiredError") {
          if (auditLog) {
            console.warn(`[AUTH] Token expired for endpoint ${req.method} ${req.path}`);
          }
          return res.status(401).json({
            success: false,
            message: "Token has expired. Please login again.",
            code: "TOKEN_EXPIRED",
            expiredAt: err.expiredAt
          });
        }
        if (err.name === "JsonWebTokenError") {
          if (auditLog) {
            console.warn(`[AUTH] Invalid token: ${err.message} for endpoint ${req.method} ${req.path}`);
          }
          return res.status(401).json({
            success: false,
            message: "Invalid or malformed token.",
            code: "INVALID_TOKEN"
          });
        }
        throw err;
      }

      // Verify user still exists and is active
      const { rows } = await pool.query(
        `SELECT id, email, role, department, is_active, created_at 
         FROM users 
         WHERE id = $1`,
        [decoded.id]
      );

      if (rows.length === 0) {
        if (auditLog) {
          console.warn(`[AUTH] User not found (ID: ${decoded.id}) for endpoint ${req.method} ${req.path}`);
        }
        return res.status(401).json({
          success: false,
          message: "User account not found.",
          code: "USER_NOT_FOUND"
        });
      }

      const user = rows[0];

      // Check if user account is active
      if (!user.is_active) {
        if (auditLog) {
          console.warn(`[AUTH] Inactive user (ID: ${user.id}) attempted access to ${req.method} ${req.path}`);
        }
        return res.status(403).json({
          success: false,
          message: "Account is inactive or has been deactivated.",
          code: "ACCOUNT_INACTIVE"
        });
      }

      // Attach user info to request object for downstream middleware/controllers
      req.user = user;

      // Attach decoded token info for debugging
      req.token = {
        issuedAt: new Date(decoded.iat * 1000),
        expiresAt: new Date(decoded.exp * 1000)
      };

      if (auditLog && process.env.DEBUG_AUTH === "true") {
        console.log(`[AUTH] Authenticated user: ${user.email} (${user.id}) for ${req.method} ${req.path}`);
      }

      next();
    } catch (err) {
      console.error("[AUTH] Middleware error:", err);
      return res.status(500).json({
        success: false,
        message: "Authentication service error.",
        code: "AUTH_ERROR"
      });
    }
  };
};

/**
 * Middleware to verify JWT_SECRET is configured
 * Call this during app initialization to fail fast if security is misconfigured
 */
const verifyJwtSecretConfigured = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "FATAL: JWT_SECRET environment variable is not configured. " +
      "This is a critical security requirement. Set JWT_SECRET to a strong random value."
    );
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.warn(
      "WARNING: JWT_SECRET is less than 32 characters. " +
      "Recommended minimum is 32 characters for adequate security."
    );
  }
};

/**
 * Create authorization middleware with role checking
 * 
 * @param {string|Array<string>} allowedRoles - Single role or array of allowed roles
 * @returns {Function} Express middleware
 */
const authorize = (allowedRoles = []) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    // Verify user is authenticated (should run after authMiddleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
        code: "NOT_AUTHENTICATED"
      });
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      console.warn(
        `[AUTHZ] User ${req.user.email} (role: ${req.user.role}) denied access to ${req.method} ${req.path}`
      );

      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource.",
        code: "INSUFFICIENT_PERMISSION",
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

module.exports = {
  createAuthMiddleware,
  verifyJwtSecretConfigured,
  authorize
};
