import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getReviewsForUser } from '../services/feedbackService';
import { getProfile } from '../services/userService';
import { FaArrowLeft, FaUserCircle, FaStar } from 'react-icons/fa';
import StarRating from '../components/Feedback/StarRating'; // Reusable star component

// A helper function to get user info from localStorage
const readUser = () => {
    try {
        const u = localStorage.getItem("user");
        if (u) return JSON.parse(u);
    } catch (err) { /* ignore */ }
    return null;
};

export default function ReviewsPage() {
    const [currentUser, setCurrentUser] = useState(readUser());
    const [reviews, setReviews] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            try {
                // Fetch both profile (for average rating) and detailed reviews
                const [profileRes, reviewsRes] = await Promise.all([
                    getProfile(),
                    getReviewsForUser(currentUser.id)
                ]);
                setProfile(profileRes.data);
                setReviews(reviewsRes.data || []);
            } catch (err) {
                toast.error("Failed to load reviews.");
                console.error("Fetch reviews error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUser]);

    if (loading) {
        return <div className="p-8 text-center">Loading reviews...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link 
                        to={`/${currentUser.role}/dashboard`} 
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
                    >
                        <FaArrowLeft />
                        Back to Dashboard
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-800">My Reviews</h1>
                    <p className="text-gray-500 mt-2">Here's what others have said about your work and collaboration.</p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <span className="text-2xl font-bold text-yellow-500">{profile?.rating || 0}/5</span>
                        <FaStar className="text-yellow-400 text-2xl" />
                        <span className="text-gray-600">({reviews.length} total reviews)</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {reviews.length > 0 ? (
                        reviews.map(review => (
                            <div key={review._id} className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                                <div className="flex items-start gap-4">
                                    {review.reviewer?.profilePicture ? (
                                        <img src={`http://localhost:5001/${review.reviewer.profilePicture}`} alt={review.reviewer.name} className="w-12 h-12 rounded-full object-cover" />
                                    ) : (
                                        <FaUserCircle className="text-gray-400 text-5xl" />
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-gray-800">{review.reviewer?.name || "Anonymous"}</p>
                                            <StarRating rating={review.rating} isEditable={false} />
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Reviewed on: {new Date(review.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className="mt-3 text-gray-700 bg-gray-50 p-3 rounded-md">
                                            "{review.comment}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center bg-white p-12 rounded-xl shadow-md">
                            <h3 className="text-xl font-semibold text-gray-700">No reviews yet.</h3>
                            <p className="text-gray-500 mt-2">Complete a project to receive feedback from your collaborator.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}