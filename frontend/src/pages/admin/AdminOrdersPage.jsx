import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../api/apiService';
import Loader from '../../components/Loader';

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const response = await getAllOrders();
            // The fix is to use response.data, which contains the array of orders
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

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            {success && <p className="text-green-500 bg-green-100 p-3 rounded-md mb-4">{success}</p>}
            <div className="overflow-x-auto bg-white p-4 rounded-lg shadow">
                <table className="min-w-full bg-white">
                    <thead>
                    <tr>
                        <th className="py-2 px-4 border-b text-left">Order ID</th>
                        <th className="py-2 px-4 border-b text-left">Customer</th>
                        <th className="py-2 px-4 border-b text-left">Status</th>
                        <th className="py-2 px-4 border-b text-left">Date</th>
                        <th className="py-2 px-4 border-b text-left">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td className="py-2 px-4 border-b">{order.id}</td>
                            {/* Assuming the user object is directly on the order */}
                            <td className="py-2 px-4 border-b">{order.user ? order.user.username : 'N/A'}</td>
                            <td className="py-2 px-4 border-b">{order.status}</td>
                            <td className="py-2 px-4 border-b">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="py-2 px-4 border-b">
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
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrdersPage;