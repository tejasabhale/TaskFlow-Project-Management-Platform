import api from "../api/axios";

export const getProjectById = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
};

export const updateProject = async (projectId, projectData) => {
  const response = await api.patch(`/projects/${projectId}`, projectData);
  return response.data;
};

export const deleteProject = async (projectId) => {
  const response = await api.delete(`/projects/${projectId}`);
  return response.data;
};

export const getProjectStats = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/stats`);
  return response.data;
};

export const createTask = async (projectId, taskData) => {
  const response = await api.post(`/projects/${projectId}/tasks`, taskData);
  return response.data;
};

export const getMyProjects = async()=>{
  const response = await api.get("/projects/me");
  return response.data;
}
