import api from "../api/axios";

export const updateAvatar = async (avatar) => {
  const formData = new FormData();
  formData.append("avatar", avatar);
  const response = await api.patch("/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteAvatar = async () => {
  const response = await api.delete("/profile/avatar");
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/profile/me");
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.patch("/profile/update", profileData);
  return response.data;
};

export const changePassword = async ({
  currentPassword,
  newPassword,
  confirmPassword,
}) => {
  const response = await api.patch("/profile/change-password", {
    currentPassword,
    newPassword,
    confirmPassword,
  });
  return response.data;
};
