// src/components/Feedback/FeedbackModal.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import StarRating from './StarRating';
// --- PATH CORRECTED HERE ---
import { submitFeedback } from '../../services/feedbackService';

export default function FeedbackModal({ project, onClose, onFeedbackSubmitted }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            return toast.error("Please select a rating.");
        }
        if (!comment.trim()) {
            return toast.error("Please leave a comment.");
        }

        try {
            await submitFeedback({ projectId: project._id, rating, comment });
            toast.success("Thank you for your feedback!");
            onFeedbackSubmitted();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.msg || "Failed to submit feedback.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Leave Feedback for "{project.title}"</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Your Rating</label>
                        <StarRating rating={rating} setRating={setRating} />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">Your Comment</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg h-32"
                            placeholder="Describe your experience..."
                        />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">
                            Submit Feedback
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}