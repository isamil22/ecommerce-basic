// frontend/src/pages/ProductDetailPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, addToCart, getBestsellers } from '../api/apiService';
import Loader from '../components/Loader';
import CommentForm from '../components/CommentForm';
import ProductSlider from '../components/ProductSlider';
import VisitorCounter from '../components/VisitorCounter.jsx';
import CountdownBar from '../components/CountdownBar';

const ProductDetailPage = ({ fetchCartCount, isAuthenticated }) => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [bestsellers, setBestsellers] = useState([]);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('description');

    // --- NEW STATE FOR VARIANTS ---
    const [selectedOptions, setSelectedOptions] = useState({});

    const navigate = useNavigate();

    const fetchProduct = () => {
        setLoading(true);
        window.scrollTo(0, 0);
        Promise.all([
            getProductById(id),
            getBestsellers()
        ])
            .then(([productResponse, bestsellersResponse]) => {
                const productData = productResponse.data;
                setProduct(productData);

                // --- NEW: Set initial variant options ---
                if (productData.hasVariants && productData.variantTypes.length > 0) {
                    const initialOptions = {};
                    productData.variantTypes.forEach(vt => {
                        initialOptions[vt.name] = vt.options[0];
                    });
                    setSelectedOptions(initialOptions);
                }

                if (productData.images && productData.images.length > 0) {
                    setSelectedImage(productData.images[0]);
                }
                setBestsellers(bestsellersResponse.data);
            })
            .catch(err => {
                console.error("Failed to fetch product details:", err);
                setError('Product not found or an error occurred.');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    // --- NEW: Memoized calculation for the active variant ---
    const activeVariant = useMemo(() => {
        if (!product || !product.hasVariants) return null;
        return product.variants.find(v =>
            Object.entries(selectedOptions).every(([key, value]) => v.variantMap[key] === value)
        );
    }, [product, selectedOptions]);

    useEffect(() => {
        if (activeVariant && activeVariant.imageUrl) {
            setSelectedImage(activeVariant.imageUrl);
        } else if (product && product.images && product.images.length > 0) {
            setSelectedImage(product.images[0]);
        }
    }, [activeVariant, product]);

    const handleCommentAdded = () => {
        fetchProduct();
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }
        try {
            const variantId = activeVariant ? activeVariant.id : null;
            await addToCart(id, quantity, variantId);
            setMessage('Product added to cart!');
            fetchCartCount();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Failed to add to cart:', error);
            setMessage('Failed to add product to cart.');
        }
    };

    // --- NEW: Handler for variant selection ---
    const handleOptionSelect = (typeName, optionValue) => {
        setSelectedOptions(prev => ({
            ...prev,
            [typeName]: optionValue
        }));
    };

    if (loading) return <Loader />;
    if (error) return <div className="text-center text-red-500 mt-8">{error}</div>;
    if (!product) return null;

    const displayPrice = activeVariant ? activeVariant.price : product.price;
    const displayStock = activeVariant ? activeVariant.stock : product.quantity;

    return (
        <div className="container mx-auto p-4 pt-10">
            <CountdownBar />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div>
                    <div className="mb-4">
                        <img src={selectedImage} alt="Selected product view" className="w-full h-auto object-cover rounded-lg shadow-lg" style={{ maxHeight: '500px' }} />
                    </div>
                    <div className="flex space-x-2 overflow-x-auto">
                        {product.images.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt={`Thumbnail ${index + 1}`}
                                className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 ${selectedImage === img ? 'border-pink-500' : 'border-transparent'}`}
                                onClick={() => setSelectedImage(img)}
                            />
                        ))}
                    </div>
                </div>

                {/* Product Details */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                    <p className="text-2xl text-pink-600 font-semibold mb-4">${displayPrice}</p>
                    <p className="text-gray-700 mb-4">{product.description.replace(/<[^>]+>/g, '')}</p>

                    {/* --- NEW: Variant Selection UI --- */}
                    {product.hasVariants && product.variantTypes.map(vt => (
                        <div key={vt.name} className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">{vt.name}</h3>
                            <div className="flex flex-wrap gap-2">
                                {vt.options.map(option => (
                                    <button
                                        key={option}
                                        onClick={() => handleOptionSelect(vt.name, option)}
                                        className={`px-4 py-2 border rounded-md text-sm ${selectedOptions[vt.name] === option ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-gray-700'}`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="flex items-center space-x-4 mb-4">
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10)))}
                            className="w-20 p-2 border rounded-md text-center"
                            min="1"
                        />
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 bg-pink-600 text-white py-2 px-6 rounded-md hover:bg-pink-700 disabled:bg-gray-400"
                            disabled={displayStock <= 0}
                        >
                            {displayStock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                    </div>
                    {message && <p className="text-green-500">{message}</p>}
                </div>
            </div>

            {/* Tabs for Description and Reviews */}
            <div className="mt-12">
                <div className="border-b">
                    {/* ... Tabs UI remains the same ... */}
                </div>
            </div>

            {/* Bestsellers Section */}
            <div className="mt-16 border-t border-gray-200">
                <ProductSlider title="Our Best Sellers" products={bestsellers} />
            </div>
            <VisitorCounter />
        </div>
    );
};

export default ProductDetailPage;