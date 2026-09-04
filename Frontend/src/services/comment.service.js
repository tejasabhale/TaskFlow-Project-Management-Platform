import api from "../api/axios";

export const addComment = async (taskId, content) => {
  const response = await api.post(`/comments/task/${taskId}`, {
    content,
  });
  return response.data;
};

export const getComments = async (taskId, page = 1, limit = 20) => {
  const response = await api.get(`/comments/task/${taskId}`, {
    params: {
      page,
      limit,
    },
  });
  return response.data;
};

export const updateComment = async (commentId, content) => {
  const response = await api.patch(`/comments/${commentId}`, {
    content,
  });
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};
