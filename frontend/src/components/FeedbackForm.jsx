import React, { useState } from 'react';
import ReactGA from 'react-ga4';

const FeedbackForm = () => {
    const [submitted, setSubmitted] = useState(false);

    const handleFeedback = (rating) => {
        ReactGA.event({
            category: 'Feedback',
            action: 'user_rating',
            label: `Rating: ${rating}`
        });
        setSubmitted(true);
    };

    if (submitted) {
        return <p className="text-center text-green-500 font-semibold p-4">Thank you for your feedback!</p>;
    }

    return (
        <div className="text-center p-6 border rounded-lg mt-8 bg-gray-50">
            <h3 className="font-bold mb-4 text-lg text-gray-700">How was your shopping experience?</h3>
            <div className="flex justify-center space-x-4">
                <button onClick={() => handleFeedback('Good')} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">👍 Good</button>
                <button onClick={() => handleFeedback('Okay')} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">😐 Okay</button>
                <button onClick={() => handleFeedback('Bad')} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">👎 Bad</button>
            </div>
        </div>
    );
};

export default FeedbackForm;