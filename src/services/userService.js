// src/services/userService.js
import api from './api';

export const getProfile = () => api.get('/users/profile');

export const updateProfile = (profileData) => api.put('/users/profile', profileData);

export const uploadProfilePicture = (formData) => api.post('/users/profile/picture', formData);

export const getAllClients = () => api.get('/users/clients');

export const getAllFreelancers = () => api.get('/users/freelancers');

export const changePassword = (passwordData) => api.put('/users/profile/change-password', passwordData);

export const updateNotificationPreferences = (preferences) => api.put('/users/profile/notification-preferences', preferences);

// --- NEW FUNCTION ADDED ---
// This function was missing and is required for the RateUserPage to work.
export const getCollaboratedUsers = () => api.get('/users/collaborated');

export const getAllUsers = () => api.get('/users');

export default {
    getProfile,
    updateProfile,
    uploadProfilePicture,
    getAllClients,
    getAllFreelancers,
    getAllUsers,
    changePassword,
    updateNotificationPreferences,
    getCollaboratedUsers // EXPORTED
};