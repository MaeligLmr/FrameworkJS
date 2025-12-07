import { useState } from 'react';
import { AuthContext } from './AuthContext';
import * as authService  from '../services/authService';
export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);

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
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ authToken, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
