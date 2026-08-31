import api from "../api/axios";

const getWorkspaceActivities = async (workspaceId) => {
  const response = await api.get(`/workspace/${workspaceId}`);
  return response.data;
};

const getProjectActivities = async (projectId) => {
  const response = await api.get(`/project/${projectId}`);
  return response.data;
};

const getTaskActivities = async (taskId) => {
  const response = await api.get(`/task/${taskId}`);
  return response.data;
};

export { getWorkspaceActivities, getProjectActivities, getTaskActivities };
