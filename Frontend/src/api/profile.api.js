import api from "./axios";

export const getCurrentUser = () => api.get("/profile/me");

export const updateProfile = (data) => api.patch("/profile/update", data);

export const updateAvatar = (formData) =>
  api.patch("/profile/avatar", formData);

export const deleteAvatar = () => api.delete("/profile/avatar");

export const changePassword = (data) =>
  api.patch("/profile/change-password", data);
