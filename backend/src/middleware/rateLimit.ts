import rateLimit from "express-rate-limit";

// Read helpers from env with defaults
const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = value ? Number(value) : NaN;
  return Number.isNaN(parsed) ? fallback : parsed;
};

const windowMs = toNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const maxRequests = toNumber(process.env.RATE_LIMIT_MAX, 100);

const authWindowMs = toNumber(
  process.env.AUTH_RATE_LIMIT_WINDOW_MS,
  15 * 60 * 1000
);
const authMaxRequests = toNumber(process.env.AUTH_RATE_LIMIT_MAX, 10);

// Global API limiter – applied to all /api routes
export const apiLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests from this IP, please try again later.",
  },
});

// Stricter limiter for auth endpoints (login/register)
export const authLimiter = rateLimit({
  windowMs: authWindowMs,
  max: authMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Too many login/register attempts from this IP, please try again later.",
  },
});
