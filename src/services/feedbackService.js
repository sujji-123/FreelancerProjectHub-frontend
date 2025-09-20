// src/services/feedbackService.js
import api from './api';

// Submit feedback for a project
export const submitFeedback = (feedbackData) => api.post('/feedback', feedbackData);

// Get all reviews for a specific user
export const getReviewsForUser = (userId) => api.get(`/feedback/user/${userId}`);