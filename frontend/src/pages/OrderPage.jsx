// isamil22/ecommerce-basic/ecommerce-basic-71c6fa0046a0f3d47a9ee9dfa53fa2560484eb0f/frontend/src/pages/OrderPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, createOrder } from '../api/apiService';

const OrderPage = () => {
    const [cart, setCart] = useState(null);
    const [formData, setFormData] = useState({ clientFullName: '', city: '', address: '', phoneNumber: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

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
                setError('Failed to fetch cart. Please try again.');
            }
        };
        fetchCart();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.clientFullName || !formData.city || !formData.address || !formData.phoneNumber) {
            setError('All delivery details fields are required.');
            return;
        }

        try {
            await createOrder(formData);
            setSuccess('Order placed successfully! Redirecting to profile...');
            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to place order.';
            setError(errorMessage);
        }
    };

    const calculateTotal = () => {
        if (!cart || !cart.items) return '0.00';
        return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    if (error) return <p className="text-red-500 text-center">{error}</p>;
    if (!cart) return <p className="text-center">Loading your order details...</p>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Confirm Your Order</h1>
            {cart.items.length === 0 && !success ? (
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
                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-bold text-lg text-pink-500">${calculateTotal()}</span>
                        </div>
                    </div>

                    {/* Delivery Information Form */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Delivery Details</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="clientFullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    name="clientFullName"
                                    id="clientFullName"
                                    required
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                    placeholder="Your Full Name"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ville (City)</label>
                                <input
                                    list="cities"
                                    name="city"
                                    id="city"
                                    required
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                    placeholder="Select or type your city"
                                />
                                <datalist id="cities">
                                    {moroccanCities.map(city => <option key={city} value={city} />)}
                                </datalist>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Shipping Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    id="address"
                                    required
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                    placeholder="123 Main St, Anytown"
                                />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    id="phoneNumber"
                                    required
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                    placeholder="123-456-7890"
                                />
                            </div>
                            {success && <p className="text-green-600 mb-4">{success}</p>}
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
        </div>
    );
};

export default OrderPage;