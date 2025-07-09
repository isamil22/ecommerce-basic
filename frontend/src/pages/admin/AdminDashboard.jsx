import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts, getAllOrders, deleteProduct, getPendingReviews } from '/src/api/apiService.js';

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [pendingReviews, setPendingReviews] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all dashboard data at the same time
                const [productsResponse, ordersResponse, reviewsResponse] = await Promise.all([
                    getAllProducts(),
                    getAllOrders(),
                    getPendingReviews()
                ]);

                // FIX: Use a more robust check to ensure 'products' is always an array.
                const productsArray = Array.isArray(productsResponse.data) ? productsResponse.data : productsResponse.data.content;
                setProducts(productsArray || []);

                setOrders(ordersResponse.data);
                setPendingReviews(reviewsResponse.data);
            } catch (err) {
                setError('Failed to fetch dashboard data.');
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(productId);
                setProducts(products.filter(p => p.id !== productId));
            } catch (err) {
                setError('Failed to delete product.');
            }
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            {error && <p className="text-red-500">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Product Management */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">Products</h2>
                        <Link to="/admin/products/new" className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">Add New</Link>
                    </div>
                    <ul className="space-y-2">
                        {products.slice(0, 5).map(product => (
                            <li key={product.id} className="flex justify-between items-center border-b pb-2">
                                <span>{product.name}</span>
                                <div>
                                    <Link to={`/admin/products/edit/${product.id}`} className="text-blue-500 hover:underline mr-4">Edit</Link>
                                    <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:underline">Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Link to="/admin/products" className="text-pink-500 hover:underline mt-4 inline-block">View all products</Link>
                </div>

                {/* Order Management */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4">Recent Orders</h2>
                    <ul className="space-y-2">
                        {orders.slice(0, 5).map(order => (
                            <li key={order.id} className="border-b pb-2">
                                <p>Order #{order.id} - Status: {order.status}</p>
                                <p>User ID: {order.userId}</p>
                            </li>
                        ))}
                    </ul>
                    <Link to="/admin/orders" className="text-pink-500 hover:underline mt-4 inline-block">View all orders</Link>
                </div>

                {/* Review Management Panel */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">Pending Reviews</h2>
                        <span className="text-2xl font-bold text-pink-500">{pendingReviews.length}</span>
                    </div>
                    <ul className="space-y-2">
                        {pendingReviews.slice(0, 3).map(review => (
                            <li key={review.id} className="border-b pb-2 text-sm">
                                <p className="text-gray-600 truncate">"{review.content}"</p>
                                <p className="text-gray-400">by {review.userEmail}</p>
                            </li>
                        ))}
                    </ul>
                    <Link to="/admin/reviews" className="text-pink-500 hover:underline mt-4 inline-block">Manage all reviews</Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;