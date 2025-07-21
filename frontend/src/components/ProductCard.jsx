import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
// REMOVED: import { addToCart } from '../redux/cartSlice'; // This was based on a previous file structure. Adjust if your cart logic is different.
import ReactGA from "react-ga4";

const ProductCard = ({ product }) => {
    // Correctly access the first image from the 'images' array
    const fullImageUrl = (product.images && product.images.length > 0)
        ? product.images[0]
        : 'https://placehold.co/300x300/E91E63/FFFFFF?text=Product';

    const handleAddToCart = () => {
        // NOTE: You will need to re-integrate your Redux `addToCart` dispatch here if it's still in use.
        // dispatch(addToCart(product));

        // This sends the event to Google Analytics
        ReactGA.event({
            category: 'Ecommerce',
            action: 'add_to_cart',
            label: product.name,    // The name of the product added
            value: product.price    // The price of the product
        });

        // You might want to show a notification to the user here.
        console.log(`Added ${product.name} to cart`);
    };

    return (
        <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col">
            <Link to={`/products/${product.id}`} className="block">
                <img
                    src={fullImageUrl}
                    alt={product.name}
                    className="w-full h-56 object-cover bg-gray-200"
                    // This fallback will be used if an image is missing from the backend
                    onError={(e) => {
                        e.currentTarget.onerror = null; // prevents looping
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