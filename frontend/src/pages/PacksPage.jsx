import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPackById, addToCart } from '../api/apiService';
import Loader from '../components/Loader';
import VisitorCounter from '../components/VisitorCounter'; // Import the component

const PackDetailPage = () => {
    const { id } = useParams();
    const [pack, setPack] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [selections, setSelections] = useState({});
    const [initialSelections, setInitialSelections] = useState({});
    const [composedImageUrl, setComposedImageUrl] = useState(null);
    const [initialPackImageUrl, setInitialPackImageUrl] = useState('');


    useEffect(() => {
        if (!pack || Object.keys(selections).length === 0) return;
        const isDefaultSelection = JSON.stringify(selections) === JSON.stringify(initialSelections);

        if (isDefaultSelection && initialPackImageUrl) {
            setComposedImageUrl(initialPackImageUrl);
            return;
        }

        const composeImage = async () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const imageUrls = pack.items.map(item => {
                const selectedProductId = selections[item.id];
                const allProducts = [item.defaultProduct, ...item.variationProducts];
                const selectedProduct = allProducts.find(p => p && p.id === selectedProductId);
                return selectedProduct?.images?.[0] || null;
            }).filter(Boolean);

            if (imageUrls.length === 0) {
                setComposedImageUrl(initialPackImageUrl);
                return;
            };

            try {
                const images = await Promise.all(imageUrls.map(url => {
                    return new Promise((resolve, reject) => {
                        const img = new Image();
                        img.crossOrigin = "Anonymous";
                        img.onload = () => resolve(img);
                        img.onerror = (err) => reject(new Error(`Failed to load image: ${url}`));
                        img.src = url;
                    });
                }));

                let totalWidth = 0;
                let maxHeight = 0;
                images.forEach(img => {
                    totalWidth += img.width;
                    if (img.height > maxHeight) {
                        maxHeight = img.height;
                    }
                });

                canvas.width = totalWidth;
                canvas.height = maxHeight;

                let currentX = 0;
                images.forEach(img => {
                    ctx.drawImage(img, currentX, 0);
                    currentX += img.width;
                });

                setComposedImageUrl(canvas.toDataURL('image/png'));
            } catch (err) {
                console.error("Image composition failed:", err);
                setComposedImageUrl(initialPackImageUrl);
            }
        };

        composeImage();

    }, [selections, pack, initialPackImageUrl, initialSelections]);

    useEffect(() => {
        const fetchPack = async () => {
            try {
                const response = await getPackById(id);
                const packData = response.data;
                setPack(packData);
                setComposedImageUrl(packData.imageUrl);
                setInitialPackImageUrl(packData.imageUrl);

                // --- FACEBOOK PIXEL: VIEWCONTENT EVENT ---
                if (window.fbq) {
                    window.fbq('track', 'ViewContent', {
                        content_ids: [packData.id],
                        content_name: packData.name,
                        content_type: 'product_group',
                        value: packData.price,
                        currency: 'USD'
                    });
                }
                // -----------------------------------------

                const initial = {};
                if (packData && packData.items) {
                    packData.items.forEach(item => {
                        if (item && item.defaultProduct) {
                            initial[item.id] = item.defaultProduct.id;
                        }
                    });
                }
                setSelections(initial);
                setInitialSelections(initial);
            } catch (err) {
                setError('Failed to fetch pack details. It might not exist.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPack();
    }, [id]);

    const handleSelectionChange = (packItemId, selectedProductId) => {
        setSelections(prev => ({ ...prev, [packItemId]: selectedProductId }));
    };

    const handleReset = () => {
        setSelections(initialSelections);
        setComposedImageUrl(initialPackImageUrl);
        setMessage('Selections have been reset to their default options.');
        setError('');
    };

    const handleAddToCart = async () => {
        setMessage('');
        setError('');
        try {
            const promises = Object.values(selections).map(productId => addToCart(productId, 1));
            await Promise.all(promises);

            // --- FACEBOOK PIXEL: ADD TO CART EVENT ---
            if (window.fbq) {
                window.fbq('track', 'AddToCart', {
                    content_ids: Object.values(selections),
                    content_name: pack.name,
                    content_type: 'product_group',
                    value: pack.price,
                    currency: 'USD'
                });
            }
            // -----------------------------------------

            setMessage('All selected pack items have been added to your cart!');
        } catch (err) {
            setError('Failed to add items to cart. Please make sure you are logged in.');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="container mx-auto px-4 py-12">
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
            {message && <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4">{message}</p>}

            {!pack && !loading && <p className="text-center mt-10">Pack not found.</p>}

            {pack && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Side: Pack Info & Image */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-xl">
                            <img
                                key={composedImageUrl}
                                src={composedImageUrl || 'https://placehold.co/1200x600/fde4f2/E91E63?text=Our+Pack'}
                                alt={pack.name}
                                className="w-full h-auto object-cover rounded-lg mb-6"
                            />
                            <h1 className="text-4xl font-extrabold text-gray-800">{pack.name}</h1>
                            <p className="text-3xl text-pink-500 font-bold my-3">
                                ${(pack.price || 0).toFixed(2)}
                            </p>
                            <VisitorCounter />
                            <p className="text-gray-600 leading-relaxed">{pack.description}</p>
                        </div>
                    </div>

                    {/* Right Side: Customization Options */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Customize Your Pack
                        </h2>
                        <div className="space-y-4">
                            {pack.items && pack.items.map(item => (
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
                            <button
                                onClick={handleReset}
                                className="w-full mt-4 bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition duration-300"
                            >
                                Reset to Defaults
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PackDetailPage;