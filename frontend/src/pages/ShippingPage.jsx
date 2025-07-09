import React from 'react';

const ShippingPage = () => {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Shipping & Returns</h1>
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <div className="prose max-w-none">
                    <h2>Shipping Policy</h2>
                    <p>We are committed to getting your order to you as quickly as possible. We process orders within 1-2 business days.</p>
                    <ul>
                        <li><strong>Standard Shipping:</strong> 5-7 business days.</li>
                        <li><strong>Express Shipping:</strong> 1-3 business days.</li>
                    </ul>
                    <p>Shipping costs are calculated at checkout based on your location and selected shipping method. We offer free standard shipping on all orders over $50.</p>

                    <h2 className="mt-8">Return Policy</h2>
                    <p>Your satisfaction is our priority. If you are not completely satisfied with your purchase, you may return any unopened items within 30 days of the purchase date for a full refund.</p>
                    <p>To initiate a return, please contact our customer service team through our Contact Us page with your order number and the reason for your return. Return shipping costs are the responsibility of the customer unless the item was damaged or incorrect upon arrival.</p>
                    <p>Refunds will be processed to the original payment method within 5-7 business days after we receive the returned items.</p>
                </div>
            </div>
        </div>
    );
};

export default ShippingPage;