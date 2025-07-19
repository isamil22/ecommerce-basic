//isamil22/ecommerce-basic/ecommerce-basic-84b68230fa5093db3372e926c83b8d7d7cb3ebc7/frontend/src/pages/admin/AdminOrdersPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { getAllOrders, updateOrderStatus, deleteOrder, deleteAllOrders } from '../../api/apiService';
import Loader from '../../components/Loader';

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const fetchOrders = async () => {
        try {
            const response = await getAllOrders();
            const ordersArray = Array.isArray(response.data) ? response.data : [];
            setOrders(ordersArray);
        } catch (err) {
            setError('Failed to fetch orders. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const groupedOrders = useMemo(() => {
        return orders.reduce((acc, order) => {
            const date = new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(order);
            return acc;
        }, {});
    }, [orders]);

    const sortedDates = useMemo(() => {
        return Object.keys(groupedOrders).sort((a, b) => new Date(b) - new Date(a));
    }, [groupedOrders]);


    const handleStatusChange = async (orderId, newStatus) => {
        setError('');
        setSuccess('');
        try {
            await updateOrderStatus(orderId, newStatus);
            setSuccess(`Order #${orderId} status updated successfully.`);
            fetchOrders(); // Refresh the list of orders
        } catch (err) {
            setError(`Failed to update status for order #${orderId}.`);
            console.error(err);
        }
    };

    const handleDelete = async (orderId) => {
        if (window.confirm(`Are you sure you want to delete order #${orderId}? This action cannot be undone.`)) {
            setError('');
            setSuccess('');
            try {
                await deleteOrder(orderId);
                setSuccess(`Order #${orderId} has been deleted.`);
                fetchOrders(); // Refresh list
            } catch (err) {
                setError(`Failed to delete order #${orderId}.`);
                console.error(err);
            }
        }
    };

    const handleDeleteAll = async () => {
        if (window.confirm('Are you sure you want to delete ALL orders? This action is irreversible.')) {
            setError('');
            setSuccess('');
            try {
                await deleteAllOrders();
                setSuccess('All orders have been deleted successfully.');
                fetchOrders(); // Refresh list, which will now be empty
            } catch (err) {
                setError('Failed to delete all orders.');
                console.error(err);
            }
        }
    };

    const toggleOrderDetails = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const calculateOrderTotal = (items) => {
        if (!items || !Array.isArray(items)) {
            return '0.00';
        }
        return items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };


    if (loading) {
        return <Loader />;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Orders</h1>
                <button
                    onClick={handleDeleteAll}
                    className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                >
                    Delete All Orders
                </button>
            </div>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            {success && <p className="text-green-500 bg-green-100 p-3 rounded-md mb-4">{success}</p>}

            {sortedDates.length > 0 ? (
                sortedDates.map(date => (
                    <div key={date} className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 border-b-2 pb-2">{date}</h2>
                        <div className="overflow-x-auto bg-white p-4 rounded-lg shadow">
                            <table className="min-w-full bg-white">
                                <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b text-left">Order ID</th>
                                    <th className="py-2 px-4 border-b text-left">Customer</th>
                                    <th className="py-2 px-4 border-b text-left">Total</th>
                                    <th className="py-2 px-4 border-b text-left">Status</th>
                                    <th className="py-2 px-4 border-b text-left">Time</th>
                                    <th className="py-2 px-4 border-b text-left">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {groupedOrders[date].map(order => (
                                    <React.Fragment key={order.id}>
                                        <tr className="hover:bg-gray-50">
                                            <td className="py-2 px-4 border-b">{order.id}</td>
                                            <td className="py-2 px-4 border-b">{order.clientFullName || 'N/A'}</td>
                                            <td className="py-2 px-4 border-b">${calculateOrderTotal(order.orderItems)}</td>
                                            <td className="py-2 px-4 border-b">{order.status}</td>
                                            <td className="py-2 px-4 border-b">{new Date(order.createdAt).toLocaleTimeString()}</td>
                                            <td className="py-2 px-4 border-b">
                                                <div className="flex items-center space-x-2">
                                                    <select
                                                        defaultValue={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        className="p-2 border rounded-md"
                                                    >
                                                        <option value="PREPARING">Preparing</option>
                                                        <option value="DELIVERING">Delivering</option>
                                                        <option value="DELIVERED">Delivered</option>
                                                        <option value="CANCELED">Canceled</option>
                                                    </select>
                                                    <button
                                                        onClick={() => toggleOrderDetails(order.id)}
                                                        className="py-2 px-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                                    >
                                                        {expandedOrderId === order.id ? 'Hide' : 'Details'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(order.id)}
                                                        className={`py-2 px-3 text-white rounded-md ${order.status !== 'DELIVERED' ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                                                        disabled={order.status !== 'DELIVERED'}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedOrderId === order.id && (
                                            <tr>
                                                <td colSpan="6" className="p-4 bg-gray-50 border-b">
                                                    <div className="p-4 bg-white rounded-md border">
                                                        <h4 className="font-bold text-lg mb-2">Order Details</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                            <div>
                                                                <p><strong>Full Name:</strong> {order.clientFullName}</p>
                                                                <p><strong>Address:</strong> {order.address}</p>
                                                                <p><strong>City:</strong> {order.city}</p>
                                                                <p><strong>Phone:</strong> {order.phoneNumber}</p>
                                                                <p><strong>Order Time:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                        <h5 className="font-semibold mt-4 mb-2">Items:</h5>
                                                        <ul className="list-disc list-inside space-y-1">
                                                            {order.orderItems.map(item => (
                                                                <li key={item.id}>
                                                                    Product ID: {item.productId} - Quantity: {item.quantity} - Price: ${item.price.toFixed(2)}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-500 mt-8">No orders found.</p>
            )}
        </div>
    );
};

export default AdminOrdersPage;
