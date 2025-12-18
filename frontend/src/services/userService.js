import api from './api';

export async function getUserProfile() {
    return api.request('/users/profile', { method: 'GET' });
}

export async function getUserById(userId) {
    return api.request(`/users/user/${userId}`, { method: 'GET' });
}

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

export async function changePassword(payload) {
    return api.request('/users/change-password', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
    });
}

export default { getUserProfile, getUserById, updateUserProfile, changePassword };
