import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import AuthContext from "./AuthContext";

import {
    getSession,
    loginUser,
    logoutUser,
} from "../services/auth.service.js";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore the user's session when the application loads.
    const refreshSession = useCallback(async () => {
        try {
            const response = await getSession();
            const session = response?.data;

            if (session?.authenticated && session?.user) {
                setUser(session.user);
                return session.user;
            }

            setUser(null);
            return null;
        } catch {
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshSession();
    }, [refreshSession]);

    // Login user and update global authentication state.
    const login = useCallback(async (credentials) => {
        const response = await loginUser(credentials);

        const loggedInUser =
            response?.data?.user ??
            response?.data?.data?.user;

        if (loggedInUser) {
            setUser(loggedInUser);
        } else {
            // Restore the session if the login response does not include user data.
            await refreshSession();
        }

        return response;
    }, [refreshSession]);

    // Logout user and clear global authentication state.
    const logout = useCallback(async () => {
        try {
            await logoutUser();
        } finally {
            setUser(null);
        }
    }, []);

    // Update authenticated user in memory without a full network roundtrip
    const updateUser = useCallback((updatedUserData) => {
        if (!updatedUserData) return;
        setUser((previous) => (previous ? { ...previous, ...updatedUserData } : updatedUserData));
    }, []);

    const value = useMemo(
        () => ({
            user,
            loading,
            isAuthenticated: Boolean(user),
            login,
            logout,
            refreshSession,
            updateUser,
        }),
        [user, loading, login, logout, refreshSession, updateUser]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}