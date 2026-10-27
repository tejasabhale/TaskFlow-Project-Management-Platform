
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getSession,
    loginUser,
    logoutUser,
} from "../services/auth.service.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const login = useCallback(async (credentials) => {
        const response = await loginUser(credentials);
        const loggedInUser = response?.data?.user;

        if (loggedInUser) {
            setUser(loggedInUser);
        }

        return response;
    }, []);

    const logout = useCallback(async () => {
        try {
            await logoutUser();
        } finally {
            setUser(null);
        }
    }, []);

    const value = useMemo(
        () => ({
            user,
            loading,
            isAuthenticated: Boolean(user),
            login,
            logout,
            refreshSession,
        }),
        [user, loading, login, logout, refreshSession]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}
