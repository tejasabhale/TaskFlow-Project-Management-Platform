import api from "../api/axios";

const updateAvatar = async (avatar) => {
  const formData = new FormData();
  formData.append("avatar", avatar);
  const response = await api.patch("/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const deleteAvatar = async () => {
  const response = await api.delete("/profile/avatar");
  return response.data;
};

const getCurrentUser = async () => {
  const response = await api.get("/profile/me");
  return response.data;
};

const updateProfile = async (profileData) => {
  const response = await api.patch("/profile/update", profileData);
  return response.data;
};

const changePassword = async ({
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

export {
  updateAvatar,
  deleteAvatar,
  getCurrentUser,
  updateProfile,
  changePassword,
};
