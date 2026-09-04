import api from "../api/axios";

export const createWorkspace = async (workspaceData) => {
  const response = await api.post("/workspaces", workspaceData);
  return response.data;
};

export const getAllWorkspaces = async () => {
  const response = await api.get("/workspaces");
  return response.data;
};

export const getWorkspaceById = async (workspaceId) => {
  const response = await api.get(`/workspaces/${workspaceId}`);
  return response.data;
};

export const updateWorkspace = async (workspaceId, workspaceData) => {
  const response = await api.patch(`/workspaces/${workspaceId}`, workspaceData);
  return response.data;
};

export const deleteWorkspace = async (workspaceId) => {
  const response = await api.delete(`/workspaces/${workspaceId}`);
  return response.data;
};

export const getWorkspaceMembers = async (workspaceId) => {
  const response = await api.get(`/workspaces/${workspaceId}/members`);
  return response.data;
};

export const addWorkspaceMember = async (workspaceId, memberData) => {
  const response = await api.post(
    `/workspaces/${workspaceId}/add-member`,
    memberData,
  );
  return response.data;
};

export const removeWorkspaceMember = async (workspaceId, memberId) => {
  const response = await api.delete(
    `/workspaces/${workspaceId}/remove-member/${memberId}`,
  );
  return response.data;
};

export const leaveWorkspace = async (workspaceId) => {
  const response = await api.post(`/workspaces/${workspaceId}/leave-workspace`);
  return response.data;
};

export const updateMemberRole = async (workspaceId, memberId, role) => {
  const response = await api.post(
    `/workspaces/${workspaceId}/update-member-role/${memberId}`,
    { role },
  );
  return response.data;
};

export const getWorkspaceStats = async (workspaceId) => {
  const response = await api.get(`/workspaces/${workspaceId}/stats`);
  return response.data;
};

export const getAllProjects = async (workspaceId) => {
  const response = await api.get(`/workspaces/${workspaceId}/projects`);
  return response.data;
};

export const createProject = async (workspaceId, projectData) => {
  const response = await api.post(
    `/workspaces/${workspaceId}/projects`,
    projectData,
  );
  return response.data;
};

export const createLabel = async (workspaceId, labelData) => {
  const response = await api.post(
    `/workspaces/${workspaceId}/labels`,
    labelData,
  );
  return response.data;
};

export const getLabels = async (workspaceId) => {
  const response = await api.get(`/workspaces/${workspaceId}/labels`);
  return response.data;
};
