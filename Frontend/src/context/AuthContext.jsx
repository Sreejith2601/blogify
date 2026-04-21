import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const profileData = await userService.getProfile();
          setUser(profileData.user || profileData);
        } catch (error) {
          console.error('Failed to load user profile:', error);
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const loginContext = (newToken, userData) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    if (userData) setUser(userData);
  };

  const logoutContext = () => {
    setToken(null);
    setUser(null);
    authService.logout();
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const profileData = await userService.getProfile();
        setUser(profileData.user || profileData);
      } catch (error) {
        console.error('Failed to refresh user profile:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginContext, logoutContext, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
