import api from "../api/axios";

export const updateLabel = async (labelId, name, color) => {
  const response = await api.patch(`/labels/${labelId}`, {
    name,
    color,
  });
  return response.data;
};

export const deleteLabel = async (labelId) => {
  const response = await api.delete(`/labels/${labelId}`);
  return response.data;
};

