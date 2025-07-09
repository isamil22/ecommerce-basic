import React, { useState, useEffect } from 'react';
import { getUserOrders } from '../api/apiService';
import Loader from '../components/Loader';

const UserOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await getUserOrders();
                // FIX 1: Correctly access the data from the response
                setOrders(response.data || []);
            } catch (err) {
                setError('Failed to fetch orders.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Helper function to calculate the total for an order
    const calculateTotal = (items) => {
        if (!items) return '0.00';
        return items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <p className="text-center mt-10 text-red-500">{error}</p>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">My Orders</h1>
            {orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="p-4 border rounded-lg shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-xl font-semibold">Order ID: {order.id}</h2>
                                <span className="font-bold text-lg">Total: ${calculateTotal(order.orderItems)}</span>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                                <p>Status: <span className="font-semibold">{order.status}</span></p>
                            </div>

                            <div className="mt-2 border-t pt-2">
                                <h3 className="font-semibold mb-2">Items:</h3>
                                {/* FIX 2: Use "order.orderItems" which matches the backend DTO */}
                                {order.orderItems && order.orderItems.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center text-sm mb-1">
                                        <div>
                                            {/* FIX 3: Display productId as product.name is not available */}
                                            <p>Product ID: {item.productId}</p>
                                            <p className="text-gray-500">Quantity: {item.quantity}</p>
                                        </div>
                                        <p>${item.price.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>You have no orders.</p>
            )}
        </div>
    );
};

export default UserOrdersPage;