import api from "../api/axios";

export const createTask = async (taskData) => {
  const response = await api.post("/tasks", taskData);
  return response.data;
};

export const getTasks = async (filters) => {
  const response = await api.get("/tasks", {
    params: filters,
  });

  return response.data;
};

export const getTaskById = async (taskId) => {
  const response = await api.get(`/tasks/${encodeURIComponent(taskId)}`);

  return response.data;
};

export const updateTask = async (taskId, taskData) => {
  const response = await api.patch(
    `/tasks/${encodeURIComponent(taskId)}`,
    taskData,
  );

  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${encodeURIComponent(taskId)}`);

  return response.data;
};
