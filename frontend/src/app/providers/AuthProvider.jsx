import { createContext, useState, useCallback, useEffect } from 'react';
import { authAPI, getToken, clearAllAuth, setOnAuthFailed } from '@/services/api/authAPI';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const forceLogout = useCallback(() => {
    clearAllAuth();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  // Register global 401 handler
  useEffect(() => {
    setOnAuthFailed(forceLogout);
    return () => setOnAuthFailed(null);
  }, [forceLogout]);

  // Verify token on mount
  useEffect(() => {
    const verify = async () => {
      const token = getToken();
      if (!token) { setIsLoading(false); return; }

      try {
        const response = await authAPI.me();
        if (response.success && response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          forceLogout();
        }
      } catch {
        forceLogout();
      } finally {
        setIsLoading(false);
      }
    };
    verify();
  }, [forceLogout]);

  const login = useCallback(async (email, password) => {
    const response = await authAPI.login(email, password);
    if (response.success && response.data) {
      setUser(response.data.user);
      setIsAuthenticated(true);
    }
    return response;
  }, []);

  const register = useCallback(async (userData) => {
    const response = await authAPI.register(userData);
    if (response.success && response.data) {
      setUser(response.data.user);
      setIsAuthenticated(true);
    }
    return response;
  }, []);

  const registerWithPayment = useCallback(async (userData) => {
    const response = await authAPI.registerWithPayment(userData);
    if (response.success && response.data) {
      setUser(response.data.user);
      setIsAuthenticated(true);
    }
    return response;
  }, []);

  const logout = useCallback(() => {
    forceLogout();
  }, [forceLogout]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authAPI.me();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch { /* silent */ }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      registerWithPayment,
      logout,
      refreshUser,
      userType: user?.role || 'client',
    }}>
      {children}
    </AuthContext.Provider>
  );
}