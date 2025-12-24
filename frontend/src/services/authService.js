/**
 * Service d'authentification (frontend)
 * Fournit des helpers pour s'inscrire, se connecter, vérifier le token,
 * gérer la réinitialisation de mot de passe et stocker le token/utilisateur.
 * S'appuie sur le client `api` pour les requêtes HTTP.
 */
import api from './api';

/**
 * Connexion d'un utilisateur
 * Enregistre le `token` et `user` dans `localStorage` si présents.
 */
export async function login(credentials){
  const res = await api.request('/auth/login', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(credentials)
  });
  // store token in localStorage if present
  const token = res?.token;
  const user  = res?.user;
  if (token) {
    try { localStorage.setItem('token', token); } catch { /* ignore */ }
  }
  if (user) {
    try { localStorage.setItem('user', JSON.stringify(user)); } catch { /* ignore */ }
  }
  return res;
}

/**
 * Inscription d'un nouvel utilisateur
 * Enregistre le `token` et `user` en cas de succès.
 */
export async function signup(payload){
  const res = await api.request('/auth/signup', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  const token = res?.token;
  const user  = res?.user;
  if (token) {
    try { localStorage.setItem('token', token); } catch { /* ignore */ }
  }
  if (user) {
    try { localStorage.setItem('user', JSON.stringify(user)); } catch { /* ignore */ }
  }
  return res;
}

/** Vérifie l'email via un token fourni par lien */
export async function verifyEmail(token) {
  return api.request(`/auth/verify-email/${token}`, { method: 'GET' });
}

/** Demande un email de réinitialisation de mot de passe */
export async function forgotPassword(email) {
  return api.request('/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
}

/** Réinitialise le mot de passe à l'aide d'un token temporaire */
export async function resetPassword(token, password) {
  return api.request(`/auth/reset-password/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
}

/**
 * Déconnexion
 * Appelle le backend puis nettoie le `localStorage`.
 */
export async function logout(){
  return api.request('/auth/logout', {
    method: 'POST',
  }).then(() => {
    try { localStorage.removeItem('token'); } catch { /* ignore */ }
    try { localStorage.removeItem('user'); } catch { /* ignore */ }
  });
}

/**
 * Vérifie le token depuis le `localStorage` et récupère l'utilisateur
 * Si invalide, nettoie le stockage local.
 */
export async function checkToken(){
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const res = await api.request('/auth/verify', {
      method: 'GET',
      headers: {'Authorization': `Bearer ${token}`},
    });
    // Update user in localStorage if returned
    if (res?.user) {
      try { localStorage.setItem('user', JSON.stringify(res.user)); } catch { /* ignore */ }
    }
    return res?.user || null;
  } catch {
    // Token invalid, clear localStorage
    try { 
      localStorage.removeItem('token'); 
      localStorage.removeItem('user'); 
    } catch { /* ignore */ }
    return null;
  }
}

export default { login, signup, logout, checkToken, verifyEmail, forgotPassword, resetPassword };