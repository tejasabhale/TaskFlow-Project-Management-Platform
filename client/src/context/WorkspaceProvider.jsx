import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import WorkspaceContext from "./WorkspaceContext.jsx";
import { getWorkspaces } from "../services/workspace.service.js";
import { useAuth } from "../hooks/useAuth.js";

function getId(value) {
    if (!value) return "";

    if (typeof value === "object") {
        return String(value._id || value.id || value.userId || "");
    }

    return String(value);
}

function normalizeWorkspaces(response) {
    let result = response?.data ?? response;

    if (result?.data) {
        result = result.data;
    }

    if (Array.isArray(result)) {
        return result;
    }

    if (Array.isArray(result?.workspaces)) {
        return result.workspaces;
    }

    return [];
}

function getSavedWorkspaceId() {
    try {
        const saved = localStorage.getItem("selectedWorkspace");

        if (!saved) return "";

        try {
            return getId(JSON.parse(saved));
        } catch {
            return saved;
        }
    } catch {
        return "";
    }
}

export function WorkspaceProvider({ children }) {
    const auth = useAuth();

    const user =
        auth?.user ||
        auth?.currentUser ||
        auth?.authUser ||
        (auth?._id || auth?.id ? auth : null);

    const userId = getId(user);

    const [workspaces, setWorkspaces] = useState([]);
    const [currentWorkspaceId, setCurrentWorkspaceId] = useState(
        getSavedWorkspaceId
    );

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const currentWorkspace = useMemo(
        () =>
            workspaces.find(
                (workspace) => getId(workspace) === currentWorkspaceId
            ) || null,
        [workspaces, currentWorkspaceId]
    );

    const refreshWorkspaces = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getWorkspaces();
            const workspaceList = normalizeWorkspaces(response);

            setWorkspaces(workspaceList);

            setCurrentWorkspaceId((previousId) => {
                const savedId = getSavedWorkspaceId();
                const preferredId = previousId || savedId;

                const exists = workspaceList.some(
                    (workspace) => getId(workspace) === preferredId
                );

                const nextId = exists
                    ? preferredId
                    : getId(workspaceList[0]);

                if (nextId) {
                    try {
                        localStorage.setItem("selectedWorkspace", nextId);
                    } catch {
                        // Ignore localStorage errors
                    }
                } else {
                    try {
                        localStorage.removeItem("selectedWorkspace");
                    } catch {
                        // Ignore localStorage errors
                    }
                }

                return nextId;
            });

            return workspaceList;
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load workspaces."
            );

            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!auth?.loading && auth?.isAuthenticated) {
            refreshWorkspaces();
        } else if (!auth?.loading && !auth?.isAuthenticated) {
            setWorkspaces([]);
            setCurrentWorkspaceId("");
            setLoading(false);
            setError("");
        }
    }, [auth?.loading, auth?.isAuthenticated, refreshWorkspaces]);

    // Accept either a workspace object or its ID.
    const setCurrentWorkspace = useCallback(
        (workspaceOrId) => {
            const requestedId = getId(workspaceOrId);

            const workspace = workspaces.find(
                (item) => getId(item) === requestedId
            );

            if (!workspace) return;

            setCurrentWorkspaceId(requestedId);
            try {
                localStorage.setItem("selectedWorkspace", requestedId);
            } catch {
                // Ignore localStorage errors
            }
        },
        [workspaces]
    );

    const currentMembership = useMemo(() => {
        if (!currentWorkspace || !userId) return null;

        return (
            currentWorkspace.members?.find((member) => {
                const memberUser = member.user || member.member;
                return getId(memberUser) === userId;
            }) || null
        );
    }, [currentWorkspace, userId]);

    // The owner is stored separately from members in your schema.
    const isOwner = Boolean(
        currentWorkspace &&
        userId &&
        getId(currentWorkspace.owner) === userId
    );

    const isAdmin = currentMembership?.role === "admin";

    const canManageMembers = isOwner || isAdmin;

    const value = useMemo(
        () => ({
            workspaces,
            currentWorkspace,
            currentWorkspaceId,
            setCurrentWorkspace,
            refreshWorkspaces,
            loading,
            error,
            clearWorkspaceError: () => setError(""),

            // Workspace permission values
            currentMembership,
            isOwner,
            isAdmin,
            canManageMembers,
        }),
        [
            workspaces,
            currentWorkspace,
            currentWorkspaceId,
            setCurrentWorkspace,
            refreshWorkspaces,
            loading,
            error,
            currentMembership,
            isOwner,
            isAdmin,
            canManageMembers,
        ]
    );

    return (
        <WorkspaceContext.Provider value={value}>
            {children}
        </WorkspaceContext.Provider>
    );
}

export default WorkspaceProvider;
