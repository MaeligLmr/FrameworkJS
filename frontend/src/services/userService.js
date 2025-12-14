import api from './api';

export async function getUserProfile() {
    return api.request('/users/profile', { method: 'GET' });
}

export async function updateUserProfile(payload) {
    return api.request('/users/profile', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
    });
}

export async function changePassword(payload) {
    return api.request('/users/change-password', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
    });
}

export default { getUserProfile, updateUserProfile, changePassword };
