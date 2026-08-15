import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      await api.post('/auth/login', { username, password });
      const response = await api.get('/auth/me');
      setUser(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Authentication failed. Please verify credentials.';
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setUser(null);
    }
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isHR = () => user?.role === 'HR';
  const isEmployee = () => user?.role === 'EMPLOYEE';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isHR, isEmployee }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
