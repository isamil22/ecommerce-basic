import React from 'react';

const FaqPage = () => {
    const faqs = [
        {
            question: 'What are your shipping options?',
            answer: 'We offer standard and express shipping. Standard shipping takes 5-7 business days, while express shipping takes 1-3 business days. All options are available at checkout.'
        },
        {
            question: 'What is your return policy?',
            answer: 'You can return any unopened product within 30 days of purchase for a full refund. Please visit our Shipping & Returns page for more details on how to initiate a return.'
        },
        {
            question: 'Are your products cruelty-free?',
            answer: 'Yes! We are proud to be a 100% cruelty-free brand. None of our products or ingredients are tested on animals.'
        },
        {
            question: 'How can I track my order?',
            answer: 'Once your order has shipped, you will receive an email with a tracking number and a link to track your package.'
        }
    ];

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Frequently Asked Questions</h1>
            <div className="max-w-3xl mx-auto space-y-6">
                {faqs.map((faq, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">{faq.question}</h2>
                        <p className="text-gray-600">{faq.answer}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FaqPage;