import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('airbooking_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('airbooking_access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If token exists, verify and refresh user profile
    if (token) {
      authApi.getProfile()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('airbooking_user', JSON.stringify(res.data));
        })
        .catch(() => {
          // Token may be invalid or expired
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username_or_email, password) => {
    const res = await authApi.login({ username_or_email, password });
    const { access, refresh, user: userData } = res.data;

    localStorage.setItem('airbooking_access_token', access);
    localStorage.setItem('airbooking_refresh_token', refresh);
    localStorage.setItem('airbooking_user', JSON.stringify(userData));

    setToken(access);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('airbooking_access_token');
    localStorage.removeItem('airbooking_refresh_token');
    localStorage.removeItem('airbooking_user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = Boolean(
    user && (user.role === 'ADMIN' || user.is_staff || user.is_superuser)
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        isAdmin,
        login,
        register,
        logout,
        setUser,
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
