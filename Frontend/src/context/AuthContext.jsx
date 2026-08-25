import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import authService from "../services/auth.service";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(user);

  const loadUser = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();

      const currentUser =
        response?.data?.user ?? response?.user ?? response?.data ?? null;

      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (credentials) => {
      const response = await authService.login(credentials);

      const currentUser = response?.data?.user ?? response?.user ?? null;

      if (currentUser) {
        setUser(currentUser);
      } else {
        await loadUser();
      }

      return response;
    },
    [loadUser],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      loadUser,
    }),
    [user, isAuthenticated, isLoading, login, logout, loadUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
