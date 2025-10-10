import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

/**
 * Comprehensive security headers middleware
 * Implements CSP, clickjacking protection, and other security best practices
 */

/**
 * Content Security Policy configuration
 * Prevents XSS, clickjacking, and other injection attacks
 */
export const cspMiddleware = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // TODO: Remove after moving inline scripts to files
      "'unsafe-eval'", // Required for some frameworks, remove if possible
      "https://js.stripe.com",
      "https://cdn.jsdelivr.net",
      "https://unpkg.com",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Required for styled-components, Tailwind
      "https://fonts.googleapis.com",
      "https://cdn.jsdelivr.net",
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com",
      "https://cdn.jsdelivr.net",
      "data:",
    ],
    imgSrc: [
      "'self'",
      "data:",
      "blob:",
      "https:",
      "http:", // Allow images from any HTTPS source
    ],
    connectSrc: [
      "'self'",
      "https://api.stripe.com",
      "https://*.supabase.co",
      "wss://*.supabase.co",
      "https://www.google-analytics.com",
      process.env.NODE_ENV === 'development' ? 'ws://localhost:*' : '',
      process.env.NODE_ENV === 'development' ? 'http://localhost:*' : '',
    ].filter(Boolean),
    frameSrc: [
      "'self'",
      "https://js.stripe.com",
      "https://hooks.stripe.com",
    ],
    frameAncestors: ["'self'"], // Clickjacking protection
    objectSrc: ["'none'"],
    upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    blockAllMixedContent: process.env.NODE_ENV === 'production' ? [] : null,
  },
});

/**
 * Additional security headers
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Clickjacking protection (redundant with CSP frameAncestors, but good defense in depth)
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection (legacy, but still useful for older browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy - don't leak URLs to external sites
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy (formerly Feature Policy)
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  
  // HSTS - Force HTTPS (only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  next();
};

/**
 * CORS configuration for API
 */
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      process.env.PRODUCTION_URL || 'https://elevateforhumanity.org',
      'https://elevateforhumanity.com',
      'https://www.elevateforhumanity.org',
      'https://www.elevateforhumanity.com',
    ];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

/**
 * Rate limiting configuration
 */
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

/**
 * Strict rate limiting for sensitive endpoints (auth, payments)
 */
export const strictRateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};
