// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import HelloPage from './pages/HelloPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CartPage from './pages/CartPage.jsx';
import OrderPage from './pages/OrderPage.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProductsPage from './pages/admin/AdminProductsPage.jsx';
import AdminProductForm from './pages/admin/AdminProductForm.jsx';
import AdminOrdersPage from './pages/admin/AdminOrdersPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AdminReviewsPage from './pages/admin/AdminReviewsPage.jsx';
import { getCart, getUserProfile } from './api/apiService.js';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import EmailConfirmationPage from './pages/EmailConfirmationPage.jsx';

import ContactPage from './pages/ContactPage.jsx';
import FaqPage from './pages/FaqPage.jsx';
import ShippingPage from './pages/ShippingPage.jsx';

import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.jsx';
import AdminCategoryForm from './pages/admin/AdminCategoryForm.jsx';
import AdminHeroPage from './pages/admin/AdminHeroPage.jsx';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [cartCount, setCartCount] = useState(0);

    const fetchCartCount = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await getCart();
                const items = response.data?.items || [];
                const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(totalItems);
            } catch (error) {
                console.error("Failed to fetch cart for count:", error);
                setCartCount(0);
            }
        } else {
            setCartCount(0);
        }
    };

    useEffect(() => {
        const checkAuthAndFetchRole = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                setIsAuthenticated(true);
                fetchCartCount(); // Fetch cart count on auth check
                try {
                    const response = await getUserProfile();
                    setUserRole(response.data.role);
                } catch (error) {
                    console.error("Could not fetch user profile", error);
                    setIsAuthenticated(false);
                    setUserRole(null);
                    localStorage.removeItem('token');
                }
            }
        };
        checkAuthAndFetchRole();
    }, [isAuthenticated]);

    const handleSetIsAuthenticated = (authStatus) => {
        setIsAuthenticated(authStatus);
        if (!authStatus) {
            setUserRole(null);
        }
    };

    return (
        <BrowserRouter>
            <div className="flex flex-col min-h-screen">
                <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={handleSetIsAuthenticated} userRole={userRole} cartCount={cartCount} />
                <main className="flex-grow">
                    <Routes>
                        {/* --- Public Routes --- */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/products/:id" element={<ProductDetailPage fetchCartCount={fetchCartCount} />} />
                        <Route path="/hello" element={<HelloPage />} />
                        <Route
                            path="/auth"
                            element={<AuthPage setIsAuthenticated={handleSetIsAuthenticated} />}
                        />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                        <Route path="/confirm-email/:email" element={<EmailConfirmationPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/faq" element={<FaqPage />} />
                        <Route path="/shipping" element={<ShippingPage />} />

                        {/* --- Authenticated User Routes --- */}
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/cart" element={<CartPage fetchCartCount={fetchCartCount} />} />
                        <Route path="/order" element={<OrderPage />} />

                        {/* --- Admin-Only Routes --- */}
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="hero" element={<AdminHeroPage />} />
                            <Route path="products" element={<AdminProductsPage />} />
                            <Route path="products/new" element={<AdminProductForm />} />
                            <Route path="products/edit/:id" element={<AdminProductForm />} />
                            <Route path="orders" element={<AdminOrdersPage />} />
                            <Route path="users" element={<AdminUsersPage />} />
                            <Route path="reviews" element={<AdminReviewsPage />} />
                            <Route path="categories" element={<AdminCategoriesPage />} />
                            <Route path="categories/new" element={<AdminCategoryForm />} />
                            <Route path="categories/edit/:id" element={<AdminCategoryForm />} />
                        </Route>
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;

