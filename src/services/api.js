// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: { 'Content-Type': 'application/json' },
});

// ✅ attach JWT on every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const signupUser = (userData) => api.post('/auth/signup', userData);
export const verifyOtp   = (otpData)   => api.post('/auth/verify', otpData);
export const loginUser   = (cred)      => api.post('/auth/login', cred);
export const forgotPassword = (email)  => api.post('/auth/forgot-password', email);
export const resetPassword  = (data)   => api.post('/auth/reset-password', data);

export default api;
