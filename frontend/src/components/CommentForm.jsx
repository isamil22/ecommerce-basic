import React, { useState } from 'react';
import { addComment } from '../api/apiService';

const CommentForm = ({ productId, onCommentAdded }) => {
    const [content, setContent] = useState('');
    const [score, setScore] = useState(5);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!content || score < 1 || score > 5) {
            setError('Please provide valid content and a rating between 1 and 5.');
            return;
        }

        try {
            await addComment(productId, { content, score });
            setSuccess('Thank you! Your comment has been submitted.');
            setContent('');
            setScore(5);
            if (onCommentAdded) {
                onCommentAdded();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit comment.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mt-8">
            <h3 className="text-xl font-semibold mb-4">Leave a Comment</h3>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>}
            <div className="mb-4">
                <label htmlFor="score" className="block text-sm font-medium text-gray-700">Score</label>
                <select id="score" value={score} onChange={(e) => setScore(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm">
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Good</option>
                    <option value={3}>3 - Average</option>
                    <option value={2}>2 - Fair</option>
                    <option value={1}>1 - Poor</option>
                </select>
            </div>
            <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">Your Comment</label>
                <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} required rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"></textarea>
            </div>
            <button type="submit" className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700">Submit Comment</button>
        </form>
    );
};

export default CommentForm;