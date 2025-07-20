import React, { useState } from 'react';
import { createCoupon } from '../../api/apiService';
import { toast } from 'react-toastify';

const AdminCouponsPage = () => {
    const [coupon, setCoupon] = useState({
        code: '',
        discountValue: '',
        expiryDate: '',
        type: 'USER' // Default coupon type
    });

    const handleChange = (e) => {
        setCoupon({ ...coupon, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Format the date to be compatible with backend (LocalDateTime)
            const couponData = {
                ...coupon,
                expiryDate: new Date(coupon.expiryDate).toISOString(),
            };
            await createCoupon(couponData);
            toast.success('Coupon created successfully!');
            // Reset form
            setCoupon({ code: '', discountValue: '', expiryDate: '', type: 'USER' });
        } catch (err) {
            toast.error('Failed to create coupon. Make sure the code is unique.');
            console.error(err);
        }
    };

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Create New Coupon</h1>
            <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700">Coupon Code</label>
                        <input type="text" name="code" id="code" value={coupon.code} onChange={handleChange} placeholder="e.g., SUMMER20" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"/>
                    </div>
                    <div>
                        <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700">Discount Value ($)</label>
                        <input type="number" name="discountValue" id="discountValue" value={coupon.discountValue} onChange={handleChange} placeholder="e.g., 10.50" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" min="0.01" step="0.01"/>
                    </div>
                    <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Expiry Date and Time</label>
                        <input type="datetime-local" name="expiryDate" id="expiryDate" value={coupon.expiryDate} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"/>
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Coupon Type</label>
                        <select name="type" id="type" value={coupon.type} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500">
                            <option value="USER">User</option>
                            <option value="INFLUENCER">Influencer</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                        Create Coupon
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminCouponsPage;