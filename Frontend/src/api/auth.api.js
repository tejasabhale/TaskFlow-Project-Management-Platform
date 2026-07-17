import api from "./axios";

export const register = (data) => api.post("/auth/register", data);

export const verifyOtp = (data) => api.post("/auth/verify-otp", data);

export const resendOtp = (data) => api.post("/auth/resend-otp", data);

export const login = (data) => api.post("/auth/login", data);

export const logout = () => api.post("/auth/logout");

export const refreshAccessToken = () => api.post("/auth/refresh-access-token");

export const forgotPassword = (data) => api.post("/auth/forgot-password", data);

export const resetPassword = (token, data) =>
  api.post(`/auth/reset-password/${token}`, data);
