/**
 * Service des utilisateurs (frontend)
 * Gère la récupération et la mise à jour du profil, la consultation
 * d'un utilisateur par ID et le changement de mot de passe.
 */
import api from './api';

/** Récupère le profil de l'utilisateur connecté */
export async function getUserProfile() {
    return api.request('/users/profile', { method: 'GET' });
}

/** Récupère un utilisateur public par son ID */
export async function getUserById(userId) {
    return api.request(`/users/user/${userId}`, { method: 'GET' });
}

/**
 * Met à jour le profil
 * Utilise toujours `FormData` pour supporter un éventuel upload d'avatar.
 */
export async function updateUserProfile(payload) {
    // Always use FormData for profile updates to handle potential file uploads
    const formData = new FormData();
    Object.keys(payload).forEach(key => {
        if (payload[key] !== undefined && payload[key] !== null) {
            formData.append(key, payload[key]);
        }
    });
    return api.request('/users/profile', { 
        method: 'PUT',
        body: formData
    });
}

/** Change le mot de passe (JSON) */
export async function changePassword(payload) {
    return api.request('/users/change-password', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
    });
}

export default { getUserProfile, getUserById, updateUserProfile, changePassword };
