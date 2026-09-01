import api from "../api/axios";

export const getWorkspaceActivities = async (workspaceId) => {
  const response = await api.get(`/workspace/${workspaceId}`);
  return response.data;
};

export const getProjectActivities = async (projectId) => {
  const response = await api.get(`/project/${projectId}`);
  return response.data;
};

export const getTaskActivities = async (taskId) => {
  const response = await api.get(`/task/${taskId}`);
  return response.data;
};
