import api from './api';

export const getProfile = () => api.get('/users/profile');

export const updateProfile = (profileData) => api.put('/users/profile', profileData);

export default {
    getProfile,
    updateProfile,
};