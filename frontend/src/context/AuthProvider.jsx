/**
 * AuthProvider - Fournisseur de contexte d'authentification
 * Gère l'état global de l'authentification de l'application :
 * - Token JWT et informations utilisateur
 * - Synchronisation avec localStorage
 * - Vérification automatique du token au démarrage
 * - Fonctions login/logout accessibles partout via useAuth()
 */

import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import * as authService  from '../services/authService';

export const AuthProvider = ({ children }) => {
  // État du token JWT (récupéré depuis localStorage au démarrage)
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('token'));
  
  // État de l'utilisateur connecté (récupéré depuis localStorage au démarrage)
  const [user, setUser] = useState(() => 
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  );
  
  // État de chargement pendant la vérification initiale du token
  const [loading, setLoading] = useState(true);

  /**
   * Synchronise le token avec localStorage
   * Enregistre ou supprime le token selon sa présence
   */
  useEffect(() => {
    if (authToken) {
      localStorage.setItem('token', authToken);
    } else {
      localStorage.removeItem('token');
    }
  }, [authToken]);

  /**
   * Synchronise l'utilisateur avec localStorage
   * Enregistre ou supprime les données utilisateur selon leur présence
   */
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  /**
   * Vérifie la validité du token au démarrage de l'application
   * Si le token est invalide ou expiré, déconnecte l'utilisateur
   */
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // Appel API pour valider le token
        const validatedUser = await authService.checkToken();
        if (validatedUser) {
          setUser(validatedUser);
          setAuthToken(token);
        } else {
          // Token invalide - déconnexion
          setAuthToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Token validation error:', err);
        // En cas d'erreur, on déconnecte par sécurité
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
