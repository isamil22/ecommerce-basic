import React, { useState, useEffect } from 'react';
import { getPendingReviews, approveReview, deleteReview } from '../../api/apiService.js';

const AdminReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetches reviews that are waiting for approval
    const fetchPendingReviews = async () => {
        try {
            setError('');
            setSuccess('');
            const response = await getPendingReviews();
            setReviews(response.data);
        } catch (err) {
            setError('Failed to fetch pending reviews.');
            console.error(err);
        }
    };

    // Load reviews when the component first mounts
    useEffect(() => {
        fetchPendingReviews();
    }, []);

    // Handler to approve a review
    const handleApprove = async (reviewId) => {
        try {
            await approveReview(reviewId);
            setSuccess('Review approved successfully!');
            // Refresh the list to remove the approved one
            fetchPendingReviews();
        } catch (err) {
            setError('Failed to approve review.');
            console.error(err);
        }
    };

    // Handler to delete a review
    const handleDelete = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await deleteReview(reviewId);
                setSuccess('Review deleted successfully!');
                // Refresh the list
                fetchPendingReviews();
            } catch (err) {
                setError('Failed to delete review.');
                console.error(err);
            }
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Manage Pending Reviews</h1>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            {success && <p className="text-green-500 bg-green-100 p-3 rounded-md mb-4">{success}</p>}

            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="space-y-4">
                    {reviews.length > 0 ? (
                        reviews.map(review => (
                            <div key={review.id} className="p-4 border rounded-lg shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-gray-800">User: <span className="font-normal text-gray-600">{review.userEmail}</span></p>
                                        <p className="font-semibold text-gray-800 mt-1">Rating: <span className="font-normal text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span></p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleApprove(review.id)} className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 transition-colors">Approve</button>
                                        <button onClick={() => handleDelete(review.id)} className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition-colors">Delete</button>
                                    </div>
                                </div>
                                <blockquote className="mt-2 text-gray-600 italic border-l-4 border-gray-200 pl-4">
                                    "{review.content}"
                                </blockquote>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-4">No pending reviews found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminReviewsPage;