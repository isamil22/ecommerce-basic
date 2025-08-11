// frontend/src/api/apiService.js
import axios from 'axios';

const apiService = axios.create({
    baseURL: '/api',
});

// Add JWT token to every request if it exists
apiService.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// --- UPDATED `createProduct` and `updateProduct` functions ---

export const createProduct = (formData) => {
    return apiService({
        method: 'post',
        url: '/products',
        data: formData,
        headers: {
            // Don't set Content-Type - let the browser set it automatically for multipart/form-data
            // This ensures proper boundary is set
        },
    });
};

export const updateProduct = (id, formData) => {
    return apiService({
        method: 'put',
        url: `/products/${id}`,
        data: formData,
        headers: {
            // Don't set Content-Type - let the browser set it automatically for multipart/form-data
            // This ensures proper boundary is set
        },
    });
};

// --- Other existing functions ---

export const getAllProducts = (params) => {
    return apiService.get('/products', { params });
};

export const getProductById = (id) => {
    return apiService.get(`/products/${id}`);
};

export const getHelloMessage = () => {
    return apiService.get('/hello');
};

export const registerUser = (userData) => {
    return apiService.post('/auth/register', userData);
};

export const loginUser = (credentials) => {
    return apiService.post('/auth/login', credentials);
};

export const confirmEmail = (confirmationData) => {
    return apiService.post('/auth/confirm-email', confirmationData);
};

export const logoutUser = () => {
    localStorage.removeItem('token');
};

export const getUserProfile = () => {
    return apiService.get('/auth/user/profile');
};

export const getCart = () => {
    return apiService.get('/cart');
};

export const removeCartItem = (productId) => {
    return apiService.delete(`/cart/${productId}`);
};

export const addToCart = (productId, quantity, productVariantId) => {
    return apiService.post(`/cart/add`, { productId, quantity, productVariantId });
};

export const getUserOrders = () => {
    return apiService.get('/orders/user');
};

export const getBestsellers = () => {
    return apiService.get('/products/bestsellers');
};

export const getNewArrivals = () => {
    return apiService.get('/products/new-arrivals');
};

export const deleteProduct = (id) => {
    return apiService.delete(`/products/${id}`);
};

export const getAllCategories = () => {
    return apiService.get('/categories');
};

export const createCategory = (formData) => {
    return apiService.post('/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const updateCategory = (id, formData) => {
    return apiService.put(`/categories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const deleteCategory = (id) => {
    return apiService.delete(`/categories/${id}`);
};

export const getAllOrders = () => {
    return apiService.get('/orders');
};

export const updateOrderStatus = (orderId, status) => {
    return apiService.put(`/orders/${orderId}/status?status=${status}`);
};

export const getAllUsers = () => {
    return apiService.get('/users');
};

export const updateUserRole = (userId, role) => {
    return apiService.put(`/users/${userId}/role?role=${role}`);
};

export const deleteUser = (userId) => {
    return apiService.delete(`/users/${userId}`);
};

export const addReview = (reviewData) => {
    return apiService.post('/reviews', reviewData);
};

export const getApprovedReviews = () => {
    return apiService.get('/reviews/approved');
};

export const getPendingReviews = () => {
    return apiService.get('/reviews/pending');
};

export const approveReview = (reviewId) => {
    return apiService.put(`/reviews/${reviewId}/approve`);
};

export const deleteReview = (reviewId) => {
    return apiService.delete(`/reviews/${reviewId}`);
};

export const getHero = () => {
    return apiService.get('/hero');
};

export const updateHero = (formData) => {
    return apiService.put('/hero', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const addComment = (productId, commentData) => {
    return apiService.post(`/comments/product/${productId}`, commentData);
};

export const forgotPassword = (email) => {
    return apiService.post('/auth/forgot-password', { email });
};

export const resetPassword = (token, newPassword) => {
    return apiService.post('/auth/reset-password', { token, newPassword });
};

export const uploadDescriptionImage = (formData) => {
    return apiService.post('/products/description-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const createPack = (formData) => apiService.post('/packs', formData);

export const updatePack = (id, formData) => {
    return apiService.put(`/packs/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const getAllPacks = () => {
    return apiService.get('/packs');
};

export const getPackById = (id) => {
    return apiService.get(`/packs/${id}`);
};

export const updateDefaultProductForPack = (packId, itemId, productId) => {
    return apiService.put(`/packs/${packId}/items/${itemId}/default-product`, { productId });
};

export const deletePack = (id) => {
    return apiService.delete(`/packs/${id}`);
};

export const createOrder = (orderData) => {
    const params = new URLSearchParams();
    params.append('clientFullName', orderData.clientFullName);
    params.append('city', orderData.city);
    params.append('address', orderData.address);
    params.append('phoneNumber', orderData.phoneNumber);
    if (orderData.couponCode) {
        params.append('couponCode', orderData.couponCode);
    }
    return apiService.post(`/orders?${params.toString()}`);
};

export const createGuestOrder = (orderData) => {
    return apiService.post('/orders/guest', orderData);
};

export const deleteOrder = (orderId) => {
    return apiService.delete(`/orders/${orderId}`);
};

export const deleteAllOrders = () => {
    return apiService.delete('/orders/all');
};

export const getDeletedOrders = () => {
    return apiService.get('/orders/deleted');
};

export const restoreOrder = (orderId) => {
    return apiService.post(`/orders/${orderId}/restore`);
};

export const exportOrders = () => {
    return apiService.get('/orders/export', {
        responseType: 'blob',
    });
};

export const createCoupon = (couponData) => {
    return apiService.post('/coupons', couponData);
};

export const validateCoupon = (code) => {
    return apiService.get(`/coupons/validate/${code}`);
};

export const getAllCoupons = () => {
    return apiService.get('/coupons');
};

export const deleteCoupon = (id) => {
    return apiService.delete(`/coupons/${id}`);
};

export const getCouponUsageStatistics = () => {
    return apiService.get('/coupons/usage-statistics');
};

export const getCouponUsageStatisticsById = (couponId) => {
    return apiService.get(`/coupons/${couponId}/usage-statistics`);
};

export const getProductSuggestions = (query) => {
    return apiService.get('/products/suggestions', { params: { query } });
};

export const getAnnouncement = () => {
    return apiService.get('/announcement');
};

export const updateAnnouncement = (announcementData) => {
    return apiService.put('/announcement', announcementData);
};

export const getCountdown = () => {
    return apiService.get('/countdown');
};

export const createCustomPack = (customPackData) => {
    return apiService.post('/custom-packs', customPackData);
};

export const getAllCustomPacks = () => {
    return apiService.get('/custom-packs');
};

export const getCustomPackById = (id) => {
    return apiService.get(`/custom-packs/${id}`);
};

export const updateCustomPack = (id, customPackData) => {
    return apiService.put(`/custom-packs/${id}`, customPackData);
};

export const deleteCustomPack = (id) => {
    return apiService.delete(`/custom-packs/${id}`);
};

export const getPackableProducts = () => {
    return apiService.get('/products/packable');
};

export const saveCountdown = (countdownData) => {
    return apiService.post('/countdown', countdownData);
};

export default apiService;