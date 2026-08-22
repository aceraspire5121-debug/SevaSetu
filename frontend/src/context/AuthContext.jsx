import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const checkLoggedInUser = async () => {
    const token = localStorage.getItem('sevasetu_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setWorker(res.data.worker);
      }
    } catch (err) {
      console.error('Session check failed:', err);
      localStorage.removeItem('sevasetu_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('sevasetu_token', res.data.token);
      setUser(res.data.user);
      setWorker(res.data.worker);
    }
    return res.data;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      localStorage.setItem('sevasetu_token', res.data.token);
      setUser(res.data.user);
      setWorker(res.data.worker);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('sevasetu_token');
    setUser(null);
    setWorker(null);
  };

  const refreshProfile = async () => {
    await checkLoggedInUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        worker,
        loading,
        login,
        register,
        logout,
        refreshProfile,
        setUser,
        setWorker,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
