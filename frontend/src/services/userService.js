import api from './api';

export async function getUserProfile() {
    return api.request('/users/profile', { method: 'GET' });
}

export async function updateUserProfile(payload) {
    // If payload contains an avatar file, use FormData
    if (payload.avatar instanceof File) {
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
    
    // Otherwise, send JSON
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
