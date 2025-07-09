// frontend/src/pages/AuthPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, registerUser } from '../api/apiService';
import ReCAPTCHA from 'react-google-recaptcha';

const AuthPage = ({ setIsAuthenticated }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleRecaptchaChange = (token) => {
        setRecaptchaToken(token);
        setError(''); // Clear error when user interacts with reCAPTCHA
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!recaptchaToken) {
            setError('Please complete the reCAPTCHA.');
            return;
        }

        try {
            if (isLogin) {
                const response = await loginUser({
                    email: formData.email,
                    password: formData.password,
                    recaptchaToken,
                });
                localStorage.setItem('token', response.data);
                setIsAuthenticated(true);
                navigate('/profile');
            } else {
                await registerUser({ ...formData, recaptchaToken });
                setSuccess('Registration successful! A confirmation code has been sent to your email.');
                setTimeout(() => navigate(`/confirm-email/${formData.email}`), 3000);
            }
        } catch (err) {
            const errorMessage = err.response?.data || 'An unexpected error occurred.';
            setError(typeof errorMessage === 'string' ? errorMessage : 'Login or registration failed.');
            console.error(err);
        } finally {
            // Reset reCAPTCHA after submission attempt if needed, though it often resets on its own
        }
    };

    const toggleForm = () => {
        setIsLogin(!isLogin);
        setError('');
        setSuccess('');
        setFormData({ fullName: '', email: '', password: '' });
        setRecaptchaToken(null);
    };

    return (
        <div className="flex items-center justify-center min-h-full py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isLogin ? 'Sign in to your account' : 'Create a new account'}
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        {!isLogin && (
                            <div>
                                <label htmlFor="full-name">Full Name</label>
                                <input
                                    id="full-name"
                                    name="fullName"
                                    type="text"
                                    required={!isLogin}
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                    placeholder="Full Name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                        <div>
                            <label htmlFor="email-address">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete={isLogin ? "current-password" : "new-password"}
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="flex justify-center my-4">
                        <ReCAPTCHA
                            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || 'YOUR_FALLBACK_SITE_KEY'}
                            onChange={handleRecaptchaChange}
                            onExpired={() => setRecaptchaToken(null)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        {isLogin && (
                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-medium text-pink-600 hover:text-pink-500">
                                    Forgot your password?
                                </Link>
                            </div>
                        )}
                    </div>

                    {success && <p className="text-green-600 text-sm text-center font-medium">{success}</p>}
                    {error && <p className="text-red-600 text-sm text-center font-medium">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                        >
                            {isLogin ? 'Sign in' : 'Register'}
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center">
                    <button onClick={toggleForm} className="font-medium text-pink-600 hover:text-pink-500">
                        {isLogin ? 'Don\'t have an account? Register' : 'Already have an account? Sign in'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;