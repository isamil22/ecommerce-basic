import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPackById, addToCart } from '../api/apiService';
import Loader from '../components/Loader';

/**
 * A reusable component to render a single product option with an image,
 * name, price, and radio button.
 */
const ProductOption = ({ product, packItemId, selectedProductId, onSelectionChange }) => {
    const imageUrl = (product.images && product.images.length > 0)
        ? product.images[0]
        : 'https://placehold.co/100x100/fde4f2/E91E63?text=No+Image';

    return (
        <label key={product.id} className="flex items-center p-3 rounded-lg hover:bg-pink-100 cursor-pointer transition-colors duration-200">
            <img src={imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md mr-4" />
            <div className="flex-grow">
                <span className="text-gray-800 font-medium">{product.name}</span>
                <span className="text-gray-600 block text-sm">${product.price.toFixed(2)}</span>
            </div>
            <input
                type="radio"
                name={`pack-item-${packItemId}`} // Use packItemId to group radio buttons
                value={product.id}
                checked={selectedProductId === product.id}
                onChange={() => onSelectionChange(packItemId, product.id)}
                className="h-5 w-5 text-pink-600 focus:ring-pink-500 border-gray-300"
            />
        </label>
    );
};


/**
 * A component that displays the customization options for a single item within a pack,
 * visually separating the default item from the alternative choices.
 */
const PackItemSelector = ({ item, selectedProductId, onSelectionChange }) => {
    return (
        <div className="p-4 border rounded-md mb-4 bg-gray-50">
            <h4 className="font-semibold text-lg mb-2">
                Customize Item: <span className="text-gray-600">{item.defaultProduct.name.split(' ').slice(0, 3).join(' ')}...</span>
            </h4>

            {/* Default Product Section */}
            <div>
                <h5 className="text-md font-semibold text-gray-700 mt-4 mb-2 pl-1">Included by default:</h5>
                <ProductOption
                    product={item.defaultProduct}
                    packItemId={item.id}
                    selectedProductId={selectedProductId}
                    onSelectionChange={onSelectionChange}
                />
            </div>

            {/* Variations Section - only shown if variations exist */}
            {item.variationProducts && item.variationProducts.length > 0 && (
                <div className="mt-4">
                    {/* "OR" separator */}
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-gray-50 px-3 text-sm font-medium text-gray-500">OR</span>
                        </div>
                    </div>
                    <h5 className="text-md font-semibold text-gray-700 mb-2 pl-1">Swap with another option:</h5>
                    <div className="flex flex-col space-y-2">
                        {item.variationProducts.map(product => (
                            <ProductOption
                                key={product.id}
                                product={product}
                                packItemId={item.id}
                                selectedProductId={selectedProductId}
                                onSelectionChange={onSelectionChange}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const PackDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pack, setPack] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [selections, setSelections] = useState({});

    useEffect(() => {
        const fetchPack = async () => {
            try {
                const response = await getPackById(id);
                setPack(response.data);
                const initialSelections = {};
                response.data.items.forEach(item => {
                    initialSelections[item.id] = item.defaultProduct.id;
                });
                setSelections(initialSelections);
            } catch (err) {
                setError('Failed to fetch pack details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPack();
    }, [id]);

    const handleSelectionChange = (packItemId, selectedProductId) => {
        setSelections(prev => ({
            ...prev,
            [packItemId]: selectedProductId
        }));
    };

    const handleAddToCart = async () => {
        setMessage('');
        setError('');
        try {
            const promises = Object.values(selections).map(productId => addToCart(productId, 1));
            await Promise.all(promises);
            setMessage('All selected pack items have been added to your cart! Note: Special pack pricing is not yet applied.');
        } catch (err) {
            setError('Failed to add items to cart. Please make sure you are logged in.');
            console.error(err);
        }
    };

    if (loading) return <Loader />;
    if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
    if (!pack) return <p className="text-center mt-10">Pack not found.</p>;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-800 mb-2">{pack.name}</h1>
                    <p className="text-gray-600 mb-4">{pack.description}</p>
                    <p className="text-3xl text-pink-500 font-bold">Pack Price: ${pack.price.toFixed(2)}</p>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-4">Customize Your Pack</h2>
                {message && <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4">{message}</p>}
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}

                <div>
                    {pack.items.map(item => (
                        <PackItemSelector
                            key={item.id}
                            item={item}
                            selectedProductId={selections[item.id]}
                            onSelectionChange={handleSelectionChange}
                        />
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={handleAddToCart}
                        className="w-full max-w-sm bg-pink-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-700 transition duration-300"
                    >
                        Add Selections to Cart
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                        Note: Items will be added individually. Pack pricing will be applied at a later stage.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PackDetailPage;