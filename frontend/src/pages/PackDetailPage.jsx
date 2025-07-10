import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPackById, addToCart } from '../api/apiService';
import Loader from '../components/Loader';

// ProductOption component remains the same
const ProductOption = ({ product, packItemId, selectedProductId, onSelectionChange, isDefault }) => {
    const imageUrl = (product.images && product.images.length > 0)
        ? product.images[0]
        : 'https://placehold.co/100x100/fde4f2/E91E63?text=No+Image';

    const isSelected = selectedProductId === product.id;

    const containerClasses = `
        flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 
        ${isSelected ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-300' : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'}
    `;

    return (
        <label className={containerClasses}>
            <img src={imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md mr-4" />
            <div className="flex-grow">
                <div className="flex items-center mb-1">
                    <span className="text-gray-800 font-medium">{product.name}</span>
                    {isDefault && <span className="ml-2 bg-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">Default</span>}
                </div>
                <span className="text-gray-600 block text-sm">${product.price.toFixed(2)}</span>
            </div>
            <input
                type="radio"
                name={`pack-item-${packItemId}`}
                value={product.id}
                checked={isSelected}
                onChange={() => onSelectionChange(packItemId, product.id)}
                className="h-5 w-5 text-pink-600 focus:ring-pink-500 border-gray-300"
            />
        </label>
    );
};

// This component now has the looping animation applied
const PackItemSelector = ({ item, selectedProductId, onSelectionChange }) => (
    <div className="border border-gray-200 p-4 rounded-lg mb-4 bg-white shadow-lg overflow-hidden">
        <h4 className="font-bold text-lg mb-4 text-gray-800 border-b border-gray-200 pb-3">
            Slot: <span className="text-pink-600 font-extrabold">{item.defaultProduct.name}</span>
        </h4>

        <div>
            <h5 className="font-semibold text-md text-gray-600 mb-2">✅ Included by default:</h5>
            <ProductOption
                product={item.defaultProduct}
                packItemId={item.id}
                selectedProductId={selectedProductId}
                onSelectionChange={onSelectionChange}
                isDefault={true}
            />
        </div>

        {item.variationProducts.length > 0 && (
            // MODIFICATION: The 'animate-nudge' class now applies the infinite loop.
            // The inline style for animationDelay has been removed.
            <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200 animate-nudge">
                <h5 className="font-semibold text-md text-gray-600 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Or swap with another option:
                </h5>
                <div className="space-y-3">
                    {item.variationProducts.map(product => (
                        <ProductOption
                            key={product.id}
                            product={product}
                            packItemId={item.id}
                            selectedProductId={selectedProductId}
                            onSelectionChange={onSelectionChange}
                            isDefault={false}
                        />
                    ))}
                </div>
            </div>
        )}
    </div>
);


const PackDetailPage = () => {
    const { id } = useParams();
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
            setMessage('All selected pack items have been added to your cart!');
        } catch (err) {
            setError('Failed to add items to cart. Please make sure you are logged in.');
        }
    };

    if (loading) return <Loader />;
    if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
    if (!pack) return <p className="text-center mt-10">Pack not found.</p>;

    const mainImageUrl = pack.imageUrl || 'https://placehold.co/1200x600/fde4f2/E91E63?text=Our+Pack';

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <img
                            src={mainImageUrl}
                            alt={pack.name}
                            className="w-full h-auto object-cover rounded-lg mb-6"
                        />
                        <h1 className="text-4xl font-extrabold text-gray-800">{pack.name}</h1>
                        <p className="text-3xl text-pink-500 font-bold my-3">
                            ${pack.price.toFixed(2)}
                        </p>
                        <p className="text-gray-600 leading-relaxed">{pack.description}</p>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Customize Your Pack
                    </h2>
                    {message && <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4">{message}</p>}
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}

                    <div className="space-y-4">
                        {pack.items.map(item => (
                            <PackItemSelector
                                key={item.id}
                                item={item}
                                selectedProductId={selections[item.id]}
                                onSelectionChange={handleSelectionChange}
                            />
                        ))}
                    </div>
                    <div className="mt-8">
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-pink-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-700 transition duration-300"
                        >
                            Add Selections to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackDetailPage;