import api from "../api/axios";

export const createWorkspace = async (workspaceData) => {
  const response = await api.post("/workspaces", workspaceData);
  return response.data;
};

export const getWorkspaces = async () => {
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

export const addWorkspaceMember = async (
  workspaceId,
  memberId,
  role = "member",
) => {
  const response = await api.post(`/workspaces/${workspaceId}/members`, {
    memberId,
    role,
  });

  return response.data;
};

export const updateWorkspaceMemberRole = async (
  workspaceId,
  memberId,
  role,
) => {
  const response = await api.patch(
    `/workspaces/${workspaceId}/members/${memberId}/role`,
    { role },
  );

  return response.data;
};

export const removeWorkspaceMember = async (workspaceId, memberId) => {
  const response = await api.delete(
    `/workspaces/${workspaceId}/members/${memberId}`,
  );

  return response.data;
};
