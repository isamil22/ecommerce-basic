import React from 'react';
import { Link } from 'react-router-dom';

const ProductSlider = ({ title, products }) => {
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div className="py-12">
            <h2 className="text-3xl font-bold text-center mb-8">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {products.map(product => (
                    <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
                        <Link to={`/product/${product.id}`} className="block">
                            <img
                                src={product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/600x400/E91E63/FFFFFF?text=Product'}
                                alt={product.name}
                                className="w-full h-64 object-cover"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = 'https://placehold.co/600x400/E91E63/FFFFFF?text=No+Image';
                                }}
                            />
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
                                <p className="text-pink-500 font-bold mt-2">${product.price.toFixed(2)}</p>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductSlider;