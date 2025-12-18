import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import * as authService  from '../services/authService';

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
  const [loading, setLoading] = useState(true);

  // Synchroniser authToken avec localStorage
  useEffect(() => {
    if (authToken) {
      localStorage.setItem('token', authToken);
    } else {
      localStorage.removeItem('token');
    }
  }, [authToken]);

  // Synchroniser user avec localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const validatedUser = await authService.checkToken();
        if (validatedUser) {
          setUser(validatedUser);
          setAuthToken(token);
        } else {
          // Token invalid
          setAuthToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Token validation error:', err);
        setAuthToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    // Use authService which wraps api.request
    const res = await authService.login({ email, password });
    const token = res?.token || res?.data?.token || res?.data?.token;
    if (!token) throw new Error('Aucun token reçu du serveur');

    setAuthToken(token);
    const returnedUser = res?.user || null;
    if (returnedUser) setUser(returnedUser);
    return { token, user: returnedUser };
  };

  const signup = async (payload) => {
    const res = await authService.signup(payload);
    const token = res?.token || res?.data?.token || res?.data?.token;
    if (!token) throw new Error('Aucun token reçu du serveur');

    setAuthToken(token);

    const returnedUser = res?.data?.user || res?.user || null;
    if (returnedUser) setUser(returnedUser);

    return { token, user: returnedUser };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ authToken, user, setUser, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
