import api from "../api/axios";

export const createProject = async (projectData) => {
  const response = await api.post("/projects", projectData);
  return response.data;
};

export const getProjects = async (filters) => {
  const response = await api.get("/projects", {
    params: filters,
  });

  return response.data;
};

export const getProjectById = async (projectId) => {
  const response = await api.get(`/projects/${encodeURIComponent(projectId)}`);

  return response.data;
};

export const updateProject = async (projectId, projectData) => {
  const response = await api.patch(
    `/projects/${encodeURIComponent(projectId)}`,
    projectData,
  );

  return response.data;
};

export const deleteProject = async (projectId) => {
  const response = await api.delete(
    `/projects/${encodeURIComponent(projectId)}`,
  );

  return response.data;
};
