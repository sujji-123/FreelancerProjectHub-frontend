// src/services/userService.js
import api from './api';

export const getProfile = () => api.get('/users/profile');

export const updateProfile = (profileData) => api.put('/users/profile', profileData);

export const uploadProfilePicture = (formData) => api.post('/users/profile/picture', formData);

export const getAllClients = () => api.get('/users/clients');

export const getAllFreelancers = () => api.get('/users/freelancers');

// ADDED: Function to get all users (needed for messaging)
export const getAllUsers = () => api.get('/users');

export default {
    getProfile,
    updateProfile,
    uploadProfilePicture,
    getAllClients,
    getAllFreelancers,
    getAllUsers // ADDED: Export the new function
};