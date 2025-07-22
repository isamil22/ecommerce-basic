import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, createOrder, validateCoupon } from '../api/apiService';
import { toast } from 'react-toastify';
import FeedbackForm from '../components/FeedbackForm';

const OrderPage = () => {
    const [cart, setCart] = useState(null);
    const [formData, setFormData] = useState({ clientFullName: '', city: '', address: '', phoneNumber: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    const moroccanCities = [
        "Agadir", "Al Hoceima", "Assilah", "Azemmour", "Beni Mellal", "Boujdour",
        "Casablanca", "Chefchaouen", "Dakhla", "El Jadida", "Erfoud", "Essaouira",
        "Fes", "Guelmim", "Ifrane", "Kenitra", "Khemisset", "Khouribga",
        "Ksar El Kebir", "Laayoune", "Larache", "Marrakech", "Meknes",
        "Mohammedia", "Nador", "Ouarzazate", "Oujda", "Rabat", "Safi", "Salé",
        "Settat", "Sidi Ifni", "Smara", "Tan-Tan", "Tangier", "Tarfaya",
        "Taroudant", "Taza", "Tetouan", "Tiznit"
    ];

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const response = await getCart();
                setCart(response.data);
            } catch (err) {
                setError('Failed to fetch cart. Please login and try again.');
                toast.error('Failed to fetch cart. Please login and try again.');
            }
        };
        fetchCart();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleApplyCoupon = async () => {
        if (!couponCode) {
            toast.warn('Please enter a coupon code.');
            return;
        }
        try {
            const response = await validateCoupon(couponCode);
            setDiscount(response.data.discountValue);
            setAppliedCoupon(response.data.code);
            toast.success(`Coupon "${response.data.code}" applied successfully!`);
        } catch (err) {
            setDiscount(0);
            setAppliedCoupon(null);
            toast.error('Invalid or expired coupon code.');
        }
    };

    const calculateSubtotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const subtotal = calculateSubtotal();
    const total = (subtotal - discount) > 0 ? (subtotal - discount) : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.clientFullName || !formData.city || !formData.address || !formData.phoneNumber) {
            setError('All delivery details fields are required.');
            return;
        }

        try {
            await createOrder({ ...formData, couponCode: appliedCoupon });

            // --- FACEBOOK PIXEL: PURCHASE EVENT ---
            if (window.fbq && cart) {
                window.fbq('track', 'Purchase', {
                    value: total,
                    currency: 'USD',
                    content_ids: cart.items.map(item => item.productId),
                    content_type: 'product'
                });
            }
            // ------------------------------------

            setSuccess('Order placed successfully! Redirecting to profile...');
            toast.success('Order placed successfully!');
            setTimeout(() => {
                navigate('/profile');
            }, 5000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to place order.';
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    if (error && !success) return <p className="text-red-500 text-center p-4">{error}</p>;
    if (!cart) return <p className="text-center p-4">Loading your order details...</p>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Confirm Your Order</h1>

            {success ? (
                <div className="max-w-md mx-auto text-center">
                    <p className="text-green-500 text-lg mb-4">{success}</p>
                    <FeedbackForm />
                </div>
            ) : (
                <>
                    {cart.items.length === 0 ? (
                        <p className="text-center">Your cart is empty. Add items before placing an order.</p>
                    ) : (
                        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Order Summary */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Order Summary</h2>
                                {cart.items.map(item => (
                                    <div key={item.id} className="flex justify-between items-center mb-2">
                                        <span className="text-gray-700">{item.productName} (x{item.quantity})</span>
                                        <span className="text-gray-800 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex items-center space-x-2">
                                        <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon Code" className="p-2 border rounded w-full"/>
                                        <button onClick={handleApplyCoupon} type="button" className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300">Apply</button>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t space-y-2">
                                    <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount ({appliedCoupon})</span>
                                            <span>-${parseFloat(discount).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center font-bold text-lg text-pink-500">
                                        <span>Total</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Information Form */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-semibold mb-4">Delivery Details</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label htmlFor="clientFullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                                        <input type="text" name="clientFullName" id="clientFullName" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm" placeholder="Your Full Name" />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ville (City)</label>
                                        <input list="cities" name="city" id="city" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm" placeholder="Select or type your city" />
                                        <datalist id="cities">
                                            {moroccanCities.map(city => <option key={city} value={city} />)}
                                        </datalist>
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Shipping Address</label>
                                        <input type="text" name="address" id="address" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm" placeholder="123 Main St, Anytown"/>
                                    </div>
                                    <div className="mb-6">
                                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                        <input type="tel" name="phoneNumber" id="phoneNumber" required onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm" placeholder="123-456-7890"/>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-pink-600 text-white font-bold py-2 px-4 rounded-md hover:bg-pink-700 transition duration-300"
                                    >
                                        Place Order (Cash on Delivery)
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default OrderPage;