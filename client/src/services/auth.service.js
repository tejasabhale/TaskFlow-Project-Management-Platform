import api from "../api/axios";

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const verifyOtp = async (email, otp) => {
  const response = await api.post("/auth/verify-otp", { email, otp });
  return response.data;
};

export const resendOtp = async (email) => {
  const response = await api.post("/auth/resend-otp", { email });
  return response.data;
};

export const getSession = async () => {
  const response = await api.get("/auth/session");
  return response.data;
};

export const refreshAccessToken = async () => {
  const response = await api.post("/auth/refresh-access-token");
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token, newPassword, confirmPassword) => {
  const response = await api.post(
    `/auth/reset-password/${encodeURIComponent(token)}`,
    { newPassword, confirmPassword },
  );

  return response.data;
};
