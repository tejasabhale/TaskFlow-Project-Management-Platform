import api from "../api/axios";

const getProjectById = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
};

const updateProject = async (projectId, projectData) => {
  const response = await api.patch(`/projects/${projectId}`, projectData);
  return response.data;
};

const deleteProject = async (projectId) => {
  const response = await api.delete(`/projects/${projectId}`);
  return response.data;
};

const getProjectStats = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/stats`);
  return response.data;
};

const createTask = async (projectId, taskData) => {
  const response = await api.post(`/projects/${projectId}/tasks`, taskData);
  return response.data;
};

const getAllTasks = async (projectId, page = 1, limit = 20) => {
  const response = await api.get(`/projects/${projectId}/tasks`, {
    params: {
      page,
      limit,
    },
  });
  return response.data;
};

const getMyProjects = async()=>{
  const response = await api.get("/projects/me");
  return response.data;
}

export {
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats,
  createTask,
  getAllTasks,
  getMyProjects
};
