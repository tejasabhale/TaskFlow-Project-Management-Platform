import api from "../api/axios.js";

export const getMyProfile = async () => {
  const response = await api.get("/profile/me");
  return response.data;
};

export const getUserProfileById = async (userId) => {
  const response = await api.get(`/profile/users/${userId}`);
  return response.data;
};

export const updateMyProfile = async (payload) => {
  const isFormData =
    typeof FormData !== "undefined" && payload instanceof FormData;

  const response = await api.patch(
    "/profile/me",
    payload,
    isFormData
      ? {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      : undefined,
  );

  return response.data;
};
