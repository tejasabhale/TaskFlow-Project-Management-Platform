import rateLimit from "express-rate-limit";

const commonOptions = {
  windowMs: 15 * 60 * 1000,
  max: 5,
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again after 15 minutes.",
  },
};

export const loginRateLimiter = rateLimit({
  ...commonOptions,
  skipSuccessfulRequests: true,
});

export const authRateLimiter = rateLimit(commonOptions);
