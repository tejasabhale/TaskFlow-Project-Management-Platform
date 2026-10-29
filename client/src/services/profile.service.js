import api from "../api//axios.js";

export const getMyProfile = async () => {
  const response = await api.get("/profile/me");
  return response.data;
};

export const getUserProfileById = async (userId) => {
  const response = await api.get(`/profile/users/${userId}`);
  return response.data;
};
