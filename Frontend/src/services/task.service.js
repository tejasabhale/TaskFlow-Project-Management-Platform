import api from "../api/axios";

export const createTask = async (projectId, taskData) => {
  const response = await api.post(`/projects/${projectId}/tasks`, taskData);
  return response.data;
};

export const getAllTasks = async (projectId, page = 1, limit = 20) => {
  const response = await api.get(`/projects/${projectId}/tasks`, {
    params: {
      page,
      limit,
    },
  });
  return response.data;
};

export const getTaskById = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
};

export const updateTask = async (taskId, taskData) => {
  const response = await api.patch(`/tasks/${taskId}`, taskData);
  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};

export const getMyTasks = async () => {
  const response = await api.get("/tasks/me");
  return response.data;
};

export const updateTaskStatus = async (taskId, status) => {
  const response = await api.patch(`/tasks/${taskId}/status`, {
    status,
  });
  return response.data;
};

export const assignTask = async (taskId, assignedTo) => {
  const response = await api.patch(`/tasks/${taskId}/assign`, {
    assignedTo,
  });
  return response.data;
};

export const assignLabels = async (taskId, labels) => {
  const response = await api.patch(`/tasks/${taskId}/labels`, {
    labels,
  });
  return response.data;
};

export const uploadAttachment = async (taskId, files) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("attachments", file);
  });

  const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteAttachment = async (taskId, attachmentId) => {
  const response = await api.delete(
    `/tasks/${taskId}/attachments/${attachmentId}`,
  );
  return response.data;
};
