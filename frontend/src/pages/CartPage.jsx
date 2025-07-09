import React, { useState, useEffect } from 'react';
import { getCart, removeCartItem } from '../api/apiService';
import { Link } from 'react-router-dom';

const CartPage = () => {
    const [cart, setCart] = useState(null);
    const [error, setError] = useState('');

    const fetchCart = async () => {
        try {
            const response = await getCart();
            setCart(response.data);
        } catch (err) {
            setError('Failed to fetch cart. Please try again later.');
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleRemove = async (productId) => {
        try {
            await removeCartItem(productId);
            fetchCart(); // Refresh cart after removal
        } catch (err) {
            setError('Failed to remove item from cart.');
        }
    };

    const calculateTotal = () => {
        if (!cart || !cart.items) return '0.00';
        return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    if (error) {
        return <p className="text-red-500 text-center">{error}</p>;
    }

    if (!cart) {
        return <p className="text-center">Loading cart...</p>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Your Cart</h1>
            {cart.items.length === 0 ? (
                <p className="text-center">Your cart is empty.</p>
            ) : (
                <div className="max-w-3xl mx-auto">
                    {cart.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between border-b py-4">
                            <div>
                                <h2 className="text-lg font-semibold">{item.productName}</h2>
                                <p className="text-sm text-gray-600">Unit Price: ${item.price.toFixed(2)}</p>
                                <p>Quantity: {item.quantity}</p>
                            </div>
                            <div>
                                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                <button
                                    onClick={() => handleRemove(item.productId)}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className="text-right mt-4">
                        <h2 className="text-2xl font-bold">Total: ${calculateTotal()}</h2>
                    </div>
                    <div className="text-center mt-8">
                        <Link
                            to="/order"
                            className="bg-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-700 transition duration-300"
                        >
                            Proceed to Checkout
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;