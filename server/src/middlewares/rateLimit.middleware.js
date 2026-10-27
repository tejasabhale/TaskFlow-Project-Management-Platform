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

export const forgotPasswordLimiter = rateLimit({
  ...commonOptions,
  max: 3,
  message: {
    success: false,
    message:
      "Too many password reset requests. Please try again after 15 minutes.",
  },
});

export const resetPasswordLimiter = rateLimit({
  ...commonOptions,
  message: {
    success: false,
    message:
      "Too many password reset attempts. Please try again after 15 minutes.",
  },
});
