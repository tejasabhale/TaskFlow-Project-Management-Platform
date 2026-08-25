import api from "../api/axios";

const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

const getCurrentUser = async () => {
  const response = await api.get("/profile/me");
  return response.data;
};

const refreshAccessToken = async () => {
  const response = await api.post("/auth/refresh-access-token");
  return response.data;
};

const verifyOTP = async (data) => {
  const response = await api.post("/auth/verify-otp", data);
  return response.data;
};

const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

const resetPassword = async (data) => {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  refreshAccessToken,
  verifyOTP,
  forgotPassword,
  resetPassword,
};

export default authService;
