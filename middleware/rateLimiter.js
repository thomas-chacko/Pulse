// Rate Limiting Middleware
// Prevents abuse by limiting requests per IP

import rateLimit from 'express-rate-limit';

/**
 * General rate limiter — applies to all routes
 * 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  standardHeaders: true,      // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,       // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  }
});

/**
 * Strict rate limiter — applies to write operations (POST, PUT, DELETE)
 * 20 requests per 15 minutes per IP
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 20,                    // 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  // Only count write methods
  skipIf: (req) => !['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method),
  message: {
    success: false,
    error: 'Too many write requests, please try again later.'
  }
});
