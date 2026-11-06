// API Key Authentication Middleware
// Protects all routes except /health with a Bearer token

import crypto from 'crypto';

/**
 * Extract API key from request
 * Supports: Authorization header (Bearer token) and query parameter fallback
 * @param {import('express').Request} req
 * @returns {string|null}
 */
function extractApiKey(req) {
  // Check Authorization header first (preferred)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Fallback: query parameter (useful for quick browser testing)
  if (req.query.api_key) {
    return req.query.api_key;
  }

  return null;
}

/**
 * Authentication middleware
 * Validates API key on every request except exempted routes
 * If API_KEY is not configured, ALL requests are blocked (secure by default)
 */
export function authenticate(req, res, next) {
  // Exempt routes that don't need auth
  if (req.path === '/health' && req.method === 'GET') {
    return next();
  }

  const serverApiKey = process.env.API_KEY;

  // If no API_KEY is configured, block ALL requests (secure by default)
  if (!serverApiKey) {
    return res.status(503).json({
      success: false,
      error: 'Server misconfigured — API_KEY is not set. Contact the server administrator.'
    });
  }

  const providedKey = extractApiKey(req);

  if (!providedKey) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required - Include your API key in the Authorization header'
    });
  }

  // Use constant-time comparison to prevent timing attacks
  const providedKeyBuffer = Buffer.from(providedKey);
  const serverKeyBuffer = Buffer.from(serverApiKey);

  // Compare lengths first (also in constant time)
  if (providedKeyBuffer.length !== serverKeyBuffer.length) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized — invalid API key.'
    });
  }

  // Constant-time comparison
  if (!crypto.timingSafeEqual(providedKeyBuffer, serverKeyBuffer)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized — invalid API key.'
    });
  }

  // Key is valid
  next();
}
