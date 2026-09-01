import { useCallback, useEffect, useMemo, useState } from "react";

import AuthContext from "../context/AuthContext";
import { getCurrentUser, login, logout } from "../services/auth.service";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(user);

  const loadUser = useCallback(async () => {
    try {
      const response = await getCurrentUser();

      const currentUser = response?.data ?? null;

      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleLogin = useCallback(
    async (credentials) => {
      const response = await login(credentials);

      const currentUser = response?.data?.user ?? null;

      if (currentUser) {
        setUser(currentUser);
      } else {
        await loadUser();
      }

      return response;
    },
    [loadUser],
  );

  const handleLogout = useCallback(async () => {
    setUser(null);

    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,

      login: handleLogin,
      logout: handleLogout,

      loadUser,
    }),
    [user, isAuthenticated, isLoading, handleLogin, handleLogout, loadUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
