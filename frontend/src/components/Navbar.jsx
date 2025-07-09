// frontend/src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../api/apiService';

const Navbar = ({ isAuthenticated, setIsAuthenticated, userRole, cartCount }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        setIsAuthenticated(false);
        navigate('/auth');
    };

    /**
     * A reusable and styled cart icon component.
     * @param {object} props - Component properties.
     * @param {number} props.count - The number of items in the cart.
     */
    const CartIcon = ({ count }) => (
        <Link
            to="/cart"
            className="relative flex items-center p-2 text-gray-600 hover:text-pink-500 focus:outline-none focus:text-pink-600 transition-colors duration-200"
            aria-label={`Shopping cart with ${count} items`}
        >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {count > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-pink-500 rounded-full">
                    {count}
                </span>
            )}
        </Link>
    );


    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-2xl font-bold text-pink-500">
                            BeautyCosmetics
                        </Link>
                    </div>

                    {/* Desktop Menu & Links */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        <Link to="/" className="text-gray-500 hover:text-pink-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Home</Link>
                        <Link to="/products" className="text-gray-500 hover:text-pink-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Products</Link>

                        {userRole === 'ADMIN' && (
                            <Link to="/admin/dashboard" className="font-bold text-pink-500 hover:text-pink-600 px-3 py-2 rounded-md text-sm">
                                Admin
                            </Link>
                        )}

                        {isAuthenticated ? (
                            <>
                                <Link to="/profile" className="text-gray-500 hover:text-pink-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">Profile</Link>
                                <button
                                    onClick={handleLogout}
                                    className="bg-pink-500 text-white hover:bg-pink-600 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                >
                                    Logout
                                </button>
                                {/* Desktop Cart Icon */}
                                <CartIcon count={cartCount} />
                            </>
                        ) : (
                            <Link to="/auth" className="bg-pink-500 text-white hover:bg-pink-600 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button & Cart Icon */}
                    <div className="flex items-center md:hidden">
                        {/* Mobile Cart Icon (always visible when authenticated) */}
                        {isAuthenticated && <CartIcon count={cartCount} />}

                        <button onClick={() => setIsOpen(!isOpen)} type="button" className="ml-2 bg-pink-500 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-pink-600 focus:outline-none">
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Collapsible Mobile Menu */}
            <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <Link to="/" className="text-gray-500 hover:bg-pink-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Home</Link>
                    <Link to="/products" className="text-gray-500 hover:bg-pink-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Products</Link>

                    {userRole === 'ADMIN' && (
                        <Link to="/admin/dashboard" className="text-gray-500 hover:bg-pink-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Admin</Link>
                    )}

                    {isAuthenticated ? (
                        <>
                            <Link to="/profile" className="text-gray-500 hover:bg-pink-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Profile</Link>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left bg-pink-500 text-white block px-3 py-2 rounded-md text-base font-medium"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/auth" className="bg-pink-500 text-white block px-3 py-2 rounded-md text-base font-medium">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;