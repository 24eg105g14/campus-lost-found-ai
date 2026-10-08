import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('lostlink_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (err) {
        // Stale or expired token: clear session silently
        localStorage.removeItem('lostlink_token');
        setToken('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('lostlink_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const response = await api.post('/auth/register', formData);
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('lostlink_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('lostlink_token');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
