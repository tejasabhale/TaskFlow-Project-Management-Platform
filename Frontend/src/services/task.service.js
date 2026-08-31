import api from "../api/axios";

const createTask = async (projectId, taskData) => {
  const response = await api.post(`/projects/${projectId}/tasks`, taskData);
  return response.data;
};

const getAllTasks = async (projectId, params = {}) => {
  const response = await api.get(`/projects/${projectId}/tasks`, {
    params,
  });
  return response.data;
};

const getTaskById = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
};

const updateTask = async (taskId, taskData) => {
  const response = await api.patch(`/tasks/${taskId}`, taskData);
  return response.data;
};

const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};

const getMyTasks = async () => {
  const response = await api.get("/tasks/me");
  return response.data;
};

const updateTaskStatus = async (taskId, status) => {
  const response = await api.patch(`/tasks/${taskId}/status`, {
    status,
  });
  return response.data;
};

const assignTask = async (taskId, assignedTo) => {
  const response = await api.patch(`/tasks/${taskId}/assign`, {
    assignedTo,
  });
  return response.data;
};

const assignLabels = async (taskId, labels) => {
  const response = await api.patch(`/tasks/${taskId}/labels`, {
    labels,
  });
  return response.data;
};

const uploadAttachment = async (taskId, files) => {
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

const deleteAttachment = async (taskId, attachmentId) => {
  const response = await api.delete(
    `/tasks/${taskId}/attachments/${attachmentId}`,
  );
  return response.data;
};

export {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getMyTasks,
  updateTaskStatus,
  assignTask,
  assignLabels,
  uploadAttachment,
  deleteAttachment,
};
