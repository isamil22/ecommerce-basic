import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    // Handler for the newsletter form submission
    const handleNewsletterSubmit = (event) => {
        event.preventDefault(); // Prevents the page from reloading
        const email = event.target.elements.email.value;

        if (email) {
            alert(`Thank you for subscribing with: ${email}`);
            event.target.reset(); // Clears the input field after submission
        } else {
            alert('Please enter a valid email address.');
        }
    };

    return (
        <footer className="bg-gray-800 text-gray-300 mt-12">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* About Section */}
                    <div className="mb-6 md:mb-0">
                        <h3 className="text-xl font-bold text-white mb-4">BeautyCosmetics</h3>
                        <p className="text-sm">Your one-stop shop for the best in beauty. We believe in quality, transparency, and bringing out your inner radiance.</p>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Shop</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/products" className="hover:text-pink-400 transition-colors">All Products</Link></li>
                            <li><Link to="/products?specialFilter=newArrival" className="hover:text-pink-400 transition-colors">New Arrivals</Link></li>
                            <li><Link to="/products?specialFilter=bestseller" className="hover:text-pink-400 transition-colors">Bestsellers</Link></li>
                            <li><Link to="/products?categoryId=1" className="hover:text-pink-400 transition-colors">Skincare</Link></li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
                        <ul className="space-y-2 text-sm">
                            {/* These links are placeholders. You will need to create these pages. */}
                            <li><Link to="/contact" className="hover:text-pink-400 transition-colors">Contact Us</Link></li>
                            <li><Link to="/faq" className="hover:text-pink-400 transition-colors">FAQs</Link></li>
                            <li><Link to="/shipping" className="hover:text-pink-400 transition-colors">Shipping & Returns</Link></li>
                            <li><Link to="/profile" className="hover:text-pink-400 transition-colors">My Account</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter Signup */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Stay Updated</h3>
                        <p className="text-sm mb-4">Subscribe to our newsletter for the latest deals and new product alerts.</p>
                        <form onSubmit={handleNewsletterSubmit}>
                            <div className="flex items-center">
                                <input
                                    type="email"
                                    name="email" // Added name attribute
                                    placeholder="Your email address"
                                    className="w-full px-4 py-2 text-gray-800 rounded-l-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                />
                                <button
                                    type="submit"
                                    className="bg-pink-500 text-white px-4 py-2 rounded-r-md hover:bg-pink-600 transition-colors"
                                >
                                    Go
                                </button>
                            </div>
                        </form>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-center md:text-left mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} BeautyCosmetics. All rights reserved.
                    </p>
                    <div className="flex justify-center space-x-6">
                        {/* Replace '#' with your actual social media URLs */}
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                            <span className="sr-only">Facebook</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                            </svg>
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                            <span className="sr-only">Instagram</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M12 2C8.69 2 8.333.015 7.053.057 5.775.098 5.005.333 4.126.68c-.878.347-1.585.86-2.285 1.56C1.14 2.924.627 3.63.28 4.508c-.347.88-.582 1.65-.623 2.928C-2.356 8.333-2.37 8.69-2.37 12s.015 3.667.057 4.947c.04.128.275.908.623 1.787.347.878.86 1.585 1.56 2.285.698.702 1.407.215 2.285.563.88.347 1.65.582 2.928.623 1.28.042 1.637.057 4.947.057s3.667-.015 4.947-.057c1.278-.04 2.048-.275 2.928-.623.878-.347 1.585-.86 2.285-1.56.702-.698 1.215-1.407 1.562-2.285.347-.88.582-1.65.623-2.928.042-1.28.057-1.637.057-4.947s-.015-3.667-.057-4.947c-.04-1.278-.275-2.048-.623-2.928-.347-.878-.86-1.585-1.562-2.285C19.076 1.14 18.37.627 17.492.28c-.88-.347-1.65-.582-2.928-.623C13.27.015 12.91 0 9.6 0zm0 2.163c3.255 0 3.585.012 4.85.07 1.17.05 1.805.248 2.227.415.562.217.96.477 1.382.896.42.42.68.82.896 1.382.168.422.365 1.057.415 2.227.058 1.265.07 1.595.07 4.85s-.012 3.585-.07 4.85c-.05 1.17-.248 1.805-.415 2.227a3.487 3.487 0 01-.896 1.382c-.42.42-.82.68-1.382.896-.422-.168-1.057.365-2.227.415-1.265.058-1.595.07-4.85.07s-3.585-.012-4.85-.07c-1.17-.05-1.805-.248-2.227-.415a3.487 3.487 0 01-1.382-.896c-.42-.42-.68-.82-.896-1.382-.168-.422-.365-1.057-.415-2.227-.058-1.265-.07-1.595-.07-4.85s.012-3.585.07-4.85c.05-1.17.248-1.805.415-2.227.217-.562.477-.96.896-1.382.42-.42.82-.68 1.382-.896.422-.168 1.057-.365 2.227-.415C8.415 2.175 8.745 2.163 12 2.163zm0 2.713a7.124 7.124 0 100 14.248 7.124 7.124 0 000-14.248zM12 16.5a4.5 4.5 0 110-9 4.5 4.5 0 010 9zm6.363-10.882a1.636 1.636 0 11-3.272 0 1.636 1.636 0 013.272 0z" clipRule="evenodd" />
                            </svg>
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                            <span className="sr-only">Twitter</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.864 9.864 0 01-3.127 1.195 4.916 4.916 0 00-8.384 4.482A13.94 13.94 0 011.671 3.149a4.93 4.93 0 001.523 6.574 4.903 4.903 0 01-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.935 4.935 0 01-2.224.084 4.928 4.928 0 004.6 3.419A9.9 9.9 0 010 19.54a13.94 13.94 0 007.548 2.212c9.142 0 14.307-7.721 13.995-14.646A10.025 10.025 0 0024 4.557z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;