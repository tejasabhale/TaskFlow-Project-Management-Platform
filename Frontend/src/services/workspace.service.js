import api from "../api/axios";

const createWorkspace = async (workspaceData) => {
  const response = await api.post("/workspaces", workspaceData);
  return response.data;
};

const getWorkspaces = async () => {
  const response = await api.get("/workspaces");
  return response.data;
};

const getWorkspaceById = async (workspaceId) => {
  const response = await api.get(`/workspaces/${workspaceId}`);
  return response.data;
};

const updateWorkspace = async (workspaceId, workspaceData) => {
  const response = await api.patch(`/workspaces/${workspaceId}`, workspaceData);
  return response.data;
};

const deleteWorkspace = async (workspaceId) => {
  const response = await api.delete(`/workspaces/${workspaceId}`);
  return response.data;
};

const getWorkspaceMembers = async (workspaceId) => {
  const response = await api.get(`/workspaces/${workspaceId}/members`);
  return response.data;
};

const addWorkspaceMember = async (workspaceId, memberData) => {
  const response = await api.post(
    `/workspaces/${workspaceId}/add-member`,
    memberData,
  );
  return response.data;
};

const removeWorkspaceMember = async (workspaceId, memberId) => {
  const response = await api.delete(
    `/workspaces/${workspaceId}/remove-member/${memberId}`,
  );
  return response.data;
};

const leaveWorkspace = async (workspaceId) => {
  const response = await api.post(`/workspaces/${workspaceId}/leave-workspace`);
  return response.data;
};

const updateMemberRole = async (workspaceId, memberId, role) => {
  const response = await api.post(
    `/workspaces/${workspaceId}/update-member-role/${memberId}`,
    { role },
  );
  return response.data;
};

const getWorkspaceStats = async (workspaceId) => {
  const response = await api.get(`/workspaces/${workspaceId}/stats`);
  return response.data;
};

const getAllProjects = async (workspaceId) => {
  const response = await api.get(`/workspaces/${workspaceId}/projects`);
  return response.data;
};

const createProject = async (workspaceId, projectData) => {
  const response = await api.post(
    `/workspaces/${workspaceId}/projects`,
    projectData,
  );
  return response.data;
};

const createLabel = async (workspaceId, labelData) => {
  const response = await api.post(
    `/workspaces/${workspaceId}/labels`,
    labelData,
  );
  return response.data;
};

const getLabels = async (workspaceId) => {
  const response = await api.get(`/workspaces/${workspaceId}/labels`);
  return response.data;
};

export {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceMembers,
  addWorkspaceMember,
  removeWorkspaceMember,
  leaveWorkspace,
  updateMemberRole,
  getWorkspaceStats,
  getAllProjects,
  createProject,
  createLabel,
  getLabels,
};
