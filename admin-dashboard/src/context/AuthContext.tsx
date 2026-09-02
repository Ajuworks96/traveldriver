import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/api';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('admin_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('admin_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await apiClient.get('/auth/me');
          if (
            res.data.success &&
            (res.data.data.role === 'ADMIN' || res.data.data.role === 'SUPER_ADMIN')
          ) {
            setUser(res.data.data);
            localStorage.setItem('admin_user', JSON.stringify(res.data.data));
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { accessToken, user: userData } = response.data.data;

    if (userData.role !== 'ADMIN' && userData.role !== 'SUPER_ADMIN') {
      throw new Error('Access denied: Admin privileges required.');
    }

    // Save to localStorage FIRST so Axios interceptors and useEffect have access to token immediately
    localStorage.setItem('admin_token', accessToken);
    localStorage.setItem('admin_user', JSON.stringify(userData));

    setToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
