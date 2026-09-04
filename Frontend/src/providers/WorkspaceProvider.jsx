import { createContext, useContext, useEffect, useState } from "react";
import { getAllWorkspaces } from "../services/workspace.service";
import WorkspaceContext from "../context/WorkspaceContext";

export const WorkspaceProvider = ({ children }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoading(true);

        const response = await getAllWorkspaces();

        const workspaceList = response.data || [];

        setWorkspaces(Array.isArray(workspaceList) ? workspaceList : []);
      } catch (error) {
        console.error("Failed to fetch workspaces:", error);
        setWorkspaces([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (workspaces.length === 0) return;

    const savedWorkspaceId = localStorage.getItem("activeWorkspaceId");

    const savedWorkspace = workspaces.find(
      (workspace) => workspace.id === savedWorkspaceId,
    );

    if (savedWorkspace) {
      setActiveWorkspace(savedWorkspace);
    } else {
      setActiveWorkspace(workspaces[0]);
      localStorage.setItem("activeWorkspaceId", workspaces[0].id);
    }
  }, [workspaces]);

  const changeWorkspace = (workspace) => {
    setActiveWorkspace(workspace);
    localStorage.setItem("activeWorkspaceId", workspace.id);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        changeWorkspace,
        loading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};
