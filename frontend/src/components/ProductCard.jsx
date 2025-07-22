// frontend/src/components/ProductCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ReactGA from "react-ga4";

const ProductCard = ({ product }) => {
    const fullImageUrl = (product.images && product.images.length > 0)
        ? product.images[0]
        : 'https://placehold.co/300x300/E91E63/FFFFFF?text=Product';

    const handleAddToCart = () => {
        // This sends the event to Google Analytics
        ReactGA.event({
            category: 'Ecommerce',
            action: 'add_to_cart',
            label: product.name,
            value: product.price
        });

        // --- ADD THIS FOR FACEBOOK PIXEL ---
        if (typeof window.fbq === 'function') {
            window.fbq('track', 'AddToCart', {
                content_ids: [product.id],
                content_name: product.name,
                content_type: 'product',
                value: product.price,
                currency: 'USD'
            });
        }
        // ------------------------------------

        console.log(`Added ${product.name} to cart`);
    };

    return (
        <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col">
            <Link to={`/products/${product.id}`} className="block">
                <img
                    src={fullImageUrl}
                    alt={product.name}
                    className="w-full h-56 object-cover bg-gray-200"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://placehold.co/300x300/E91E63/FFFFFF?text=No+Image';
                    }}
                />
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                    <p className="text-pink-500 font-bold mt-2">${product.price?.toFixed(2)}</p>
                </div>
            </Link>

            <div className="mt-auto p-4">
                <button
                    onClick={handleAddToCart}
                    className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ProductCard;