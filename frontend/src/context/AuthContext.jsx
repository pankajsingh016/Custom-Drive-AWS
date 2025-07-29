// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE, logoutUser } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Initial state is true

  const checkSession = async () => {
    try {
      const response = await axios.get(`${API_BASE}/auth/me`, { withCredentials: true });
      if (response.data.success) {
        setUser(response.data.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Session check failed:", error);
      setUser(null);
    } finally {
      setLoading(false); // Always set loading to false when check is complete (from initial mount)
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setLoading(false); // <--- THIS IS THE CRUCIAL LINE to add/confirm
  };

  const logout = async () => {
    try {
        await logoutUser();
    } catch (error) {
        console.error("Backend logout failed:", error);
    } finally {
        setUser(null);
        setLoading(false); // Good practice to ensure loading is false after logout as well
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);