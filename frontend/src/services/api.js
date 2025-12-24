/**
 * Service API centralisé avec Axios
 * Gère toutes les requêtes HTTP vers le backend avec :
 * - Injection automatique du token JWT
 * - Gestion centralisée des erreurs 401 (déconnexion auto)
 * - Configuration de l'URL de base depuis les variables d'environnement
 */

import axios from 'axios';

// URL de base de l'API depuis les variables d'environnement Vite
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Création de l'instance axios avec configuration de base
const axiosInstance = axios.create({
  baseURL: API_BASE,
  // Ne pas définir de Content-Type par défaut - laisse chaque requête décider
  // (important pour les FormData avec images)
});

/**
 * Intercepteur de requête
 * Ajoute automatiquement le token JWT dans les headers Authorization
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Intercepteur de réponse
 * Gère les erreurs 401 (non autorisé) en déconnectant l'utilisateur
 * et en redirigeant vers la page de connexion
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si erreur 401 et pas déjà sur login/register
    if (error.response?.status === 401) {
      // Ne pas rediriger si déjà sur les pages de connexion/inscription
      if (typeof window !== 'undefined' && 
          (window.location.pathname === '/login' || window.location.pathname === '/register')) {
        return Promise.reject(error.response?.data || error);
      }
      
      // Nettoyage du localStorage et redirection
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch {
        // Ignorer les erreurs de stockage (mode privé, etc.)
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

/**
 * Fonction wrapper pour maintenir la compatibilité avec le code existant
 * @param {string} path - Chemin de l'endpoint (ex: '/articles')
 * @param {Object} options - Options de la requête (method, body, etc.)
 * @returns {Promise<any>} - Réponse de l'API
 */
export async function request(path, options = {}) {
  const { method = 'GET', headers, body, ...restOptions } = options;
  
  const config = {
    url: path,
    method,
    ...restOptions,
  };

  // Handle body/data
  if (body) {
    if (body instanceof FormData) {
      config.data = body;
      // Don't set any Content-Type - let browser/axios handle it for FormData
      config.headers = { ...headers };
    } else if (typeof body === 'string') {
      try {
        config.data = JSON.parse(body);
      } catch {
        config.data = body;
      }
      config.headers = { 'Content-Type': 'application/json', ...headers };
    } else {
      config.data = body;
      config.headers = { 'Content-Type': 'application/json', ...headers };
    }
  } else {
    config.headers = headers;
  }

  const response = await axiosInstance(config);
  return response.data;
}

export default { request, API_BASE, axiosInstance };
