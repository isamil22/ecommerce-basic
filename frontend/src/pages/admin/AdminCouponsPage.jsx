// frontend/src/pages/admin/AdminCouponsPage.jsx

import React, { useState, useEffect } from 'react';
// Assuming you have these API functions
import { createCoupon, getAllProducts, getAllCategories } from '../../api/apiService';
import { toast } from 'react-toastify';
import Select from 'react-select'; // You'll need to install this: npm install react-select

const AdminCouponsPage = () => {
    const [coupon, setCoupon] = useState({
        code: '',
        discountValue: '',
        discountType: 'FIXED_AMOUNT',
        expiryDate: '',
        type: 'USER',
        minPurchaseAmount: '',
        usageLimit: '',
        firstTimeOnly: false, // New state
        applicableProductIds: [], // New state
        applicableCategoryIds: [], // New state
    });

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isFreeShipping, setIsFreeShipping] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const productsRes = await getAllProducts();
                setProducts(productsRes.data);
                const categoriesRes = await getAllCategories();
                setCategories(categoriesRes.data);
            } catch (error) {
                toast.error("Failed to load products or categories.");
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'discountType') {
            setIsFreeShipping(value === 'FREE_SHIPPING');
        }
        setCoupon({
            ...coupon,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleMultiSelectChange = (options, field) => {
        const ids = options ? options.map(option => option.value) : [];
        setCoupon({ ...coupon, [field]: ids });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Your API call to create the coupon
            await createCoupon(coupon);
            toast.success('Coupon created successfully!');
            // Reset form state here
        } catch (err) {
            toast.error('Failed to create coupon.');
        }
    };

    const productOptions = products.map(p => ({ value: p.id, label: p.name }));
    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Create New Coupon</h1>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ... other form fields for code, expiryDate, etc. ... */}

                    <div>
                        <label className="block text-sm font-medium">Discount Type</label>
                        <select name="discountType" value={coupon.discountType} onChange={handleChange} className="mt-1 ...">
                            <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
                            <option value="PERCENTAGE">Percentage (%)</option>
                            <option value="FREE_SHIPPING">Free Shipping</option>
                        </select>
                    </div>

                    {!isFreeShipping && (
                        <div>
                            <label className="block text-sm font-medium">Discount Value</label>
                            <input type="number" name="discountValue" value={coupon.discountValue} onChange={handleChange} className="mt-1 ..."/>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium">Applicable Categories</label>
                        <Select
                            isMulti
                            options={categoryOptions}
                            onChange={(options) => handleMultiSelectChange(options, 'applicableCategoryIds')}
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty to apply to all categories.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Applicable Products</label>
                        <Select
                            isMulti
                            options={productOptions}
                            onChange={(options) => handleMultiSelectChange(options, 'applicableProductIds')}
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty to apply to all products.</p>
                    </div>


                    <div className="flex items-center">
                        <input
                            id="firstTimeOnly"
                            name="firstTimeOnly"
                            type="checkbox"
                            checked={coupon.firstTimeOnly}
                            onChange={handleChange}
                            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                        />
                        <label htmlFor="firstTimeOnly" className="ml-2 block text-sm text-gray-900">
                            For First-Time Customers Only
                        </label>
                    </div>

                    <button type="submit" className="w-full ... bg-pink-600 hover:bg-pink-700 ...">
                        Create Coupon
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminCouponsPage;