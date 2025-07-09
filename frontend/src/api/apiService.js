import axios from 'axios';

const apiService = axios.create({
    baseURL: '/api', // Correct: Use the relative path for the proxy
});

apiService.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// --- Existing Functions ---
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

// --- NEW EMAIL CONFIRMATION FUNCTION ---
export const confirmEmail = (confirmationData) => {
    return apiService.post('/auth/confirm-email', confirmationData);
};
// -----------------------------------------

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

export const addToCart = (productId, quantity) => {
    return apiService.post(`/cart/add?productId=${productId}&quantity=${quantity}`);
};


export const createOrder = (orderData) => {
    return apiService.post(`/orders?address=${orderData.address}&phoneNumber=${orderData.phoneNumber}`);
};

// --- New Function for User Orders ---
export const getUserOrders = () => {
    return apiService.get('/orders/user');
};
// fwefgwergfwreg
// --- New function for Bestsellers ---
export const getBestsellers = () => {
    return apiService.get('/products/bestsellers');
};

// --- New function for New Arrivals ---
export const getNewArrivals = () => {
    return apiService.get('/products/new-arrivals');
};

// --- ADMIN FUNCTIONS ---
export const createProduct = (productData) => {
    return apiService.post('/products', productData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const updateProduct = (id, productData) => {
    return apiService.put(`/products/${id}`, productData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const deleteProduct = (id) => {
    return apiService.delete(`/products/${id}`);
};

// --- CATEGORY API FUNCTIONS ---
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


// --- USER MANAGEMENT ADMIN FUNCTIONS ---
export const getAllUsers = () => {
    return apiService.get('/users');
};

export const updateUserRole = (userId, role) => {
    return apiService.put(`/users/${userId}/role?role=${role}`);
};

export const deleteUser = (userId) => {
    return apiService.delete(`/users/${userId}`);
};

// --- Review Functions ---
export const addReview = (reviewData) => {
    return apiService.post('/reviews', reviewData);
};

export const getApprovedReviews = () => {
    return apiService.get('/reviews/approved');
};

// --- Admin Review Functions ---
export const getPendingReviews = () => {
    return apiService.get('/reviews/pending');
};

export const approveReview = (reviewId) => {
    return apiService.put(`/reviews/${reviewId}/approve`);
};

export const deleteReview = (reviewId) => {
    return apiService.delete(`/reviews/${reviewId}`);
};



// --- Hero Section API Functions ---
export const getHero = () => {
    return apiService.get('/hero');
};

export const updateHero = (formData) => {
    return apiService.put('/hero', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// --- Comment Functions ---
export const addComment = (productId, commentData) => {
    return apiService.post(`/comments/product/${productId}`, commentData);
};

// --- NEW FORGOT PASSWORD FUNCTIONS ---
export const forgotPassword = (email) => {
    return apiService.post('/auth/forgot-password', { email });
};

export const resetPassword = (token, newPassword) => {
    return apiService.post('/auth/reset-password', { token, newPassword });
};

// --- Corrected Description Image Upload Function ---
export const uploadDescriptionImage = (formData) => {
    return apiService.post('/products/description-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};