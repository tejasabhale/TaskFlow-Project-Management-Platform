import api from "../api/axios";

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/profile/me");
  return response.data;
};

export const refreshAccessToken = async () => {
  const response = await api.post("/auth/refresh-access-token");
  return response.data;
};

export const verifyOTP = async (data) => {
  const response = await api.post("/auth/verify-otp", data);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
};

export const resendOTP = async (email) => {
  const response = await api.post("/auth/resend-otp", email);
  return response.data;
};
