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

// Upload a single attachment.
export const uploadTaskAttachment = async (taskId, file) => {
  if (!(file instanceof File)) {
    throw new Error("Please select a valid file.");
  }

  const formData = new FormData();
  formData.append("file", file, file.name);

  const response = await api.post(
    `/tasks/${encodeURIComponent(taskId)}/attachments`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

// Remove an attachment using its Cloudinary public ID.
export const deleteTaskAttachment = async (taskId, attachmentId) => {
  const response = await api.delete(
    `/tasks/${encodeURIComponent(taskId)}/attachments`,
    {
      data: { attachmentId },
    },
  );

  return response.data;
};
