import React from 'react';
import UserOrdersPage from './UserOrdersPage'; // We'll reuse the existing orders component
import ReviewForm from '../components/ReviewForm'; // And the existing review form

const ProfilePage = () => {
    // This handler can be used to refresh data if needed after a review is submitted
    const handleReviewSubmitted = () => {
        console.log("Review submitted. Data can be re-fetched here if necessary.");
    };

    // --- WhatsApp Details ---
    // Replace this with your actual WhatsApp number in international format
    const whatsappNumber = "212600000000";
    const prefilledMessage = "Hello, I have a question about my account or my orders.";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(prefilledMessage)}`;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">My Profile</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main content: Order History */}
                <div className="lg:col-span-2">
                    <UserOrdersPage />
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                    <ReviewForm onReviewSubmitted={handleReviewSubmitted} />

                    {/* --- WhatsApp Support Section --- */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4 text-center">Need Help?</h3>
                        <p className="text-center text-gray-600 mb-6">
                            Contact our support team directly on WhatsApp for any questions about your orders or account.
                        </p>
                        <div className="text-center">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition duration-300 shadow-lg"
                            >
                                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413C23.948 18.667 18.614 24 .057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51s-.371-.012-.57-.012c-.198 0-.522.074-.795.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.078 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                </svg>
                                <span>Chat on WhatsApp</span>
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;