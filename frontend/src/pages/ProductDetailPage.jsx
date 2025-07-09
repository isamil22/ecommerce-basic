import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, addToCart, getBestsellers } from '../api/apiService';
import Loader from '../components/Loader';
import CommentForm from '../components/CommentForm';
import ProductSlider from '../components/ProductSlider';

const ProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [bestsellers, setBestsellers] = useState([]);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('description');
    const navigate = useNavigate();

    const fetchProduct = () => {
        setLoading(true);
        window.scrollTo(0, 0); // Scroll to top on new product load
        Promise.all([
            getProductById(id),
            getBestsellers()
        ])
            .then(([productResponse, bestsellersResponse]) => {
                setProduct(productResponse.data);
                // Filter out the current product from the bestsellers list
                setBestsellers(bestsellersResponse.data.filter(p => p.id.toString() !== id));
                if (productResponse.data.images && productResponse.data.images.length > 0) {
                    setSelectedImage(productResponse.data.images[0]);
                }
            })
            .catch(err => {
                console.error(`Error fetching data for product id ${id}:`, err);
                setError("Product not found or an error occurred.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const handleCommentAdded = () => {
        fetchProduct();
    };

    const handleAddToCart = async () => {
        try {
            await addToCart(product.id, quantity);
            setMessage('Product added to cart successfully!');
        } catch (err) {
            setMessage('Failed to add product to cart. Please log in.');
            console.error(err);
        }
    };

    const handleOrderNow = async () => {
        try {
            await addToCart(product.id, quantity);
            navigate('/cart');
        } catch (err) {
            setMessage('Failed to add product to cart. Please log in.');
            console.error(err);
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <p className="text-center text-red-500 mt-10">{error}</p>;
    }

    if (!product) {
        return <p className="text-center mt-10">Product not found.</p>;
    }

    const imageList = product.images && product.images.length > 0
        ? product.images
        : ['https://placehold.co/600x400/E91E63/FFFFFF?text=Product'];

    const reviewCount = product.comments ? product.comments.length : 0;
    const averageRating = reviewCount > 0
        ? product.comments.reduce((acc, comment) => acc + comment.score, 0) / reviewCount
        : 0;

    const fullStars = Math.round(averageRating);
    const emptyStars = 5 - fullStars;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                {/* Image Gallery Section */}
                <div>
                    <div className="mb-4">
                        <img
                            src={selectedImage || imageList[0]}
                            alt={product.name}
                            className="w-full h-auto rounded-lg shadow-lg bg-gray-200 object-cover aspect-square"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://placehold.co/600x400/E91E63/FFFFFF?text=No+Image';
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {imageList.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt={`${product.name} thumbnail ${index + 1}`}
                                className={`w-full h-24 object-cover rounded-md cursor-pointer border-2 ${selectedImage === img ? 'border-pink-500' : 'border-transparent'}`}
                                onClick={() => setSelectedImage(img)}
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Product Details and Actions Section */}
                <div>
                    {reviewCount > 0 && (
                        <div className="flex items-center mb-2">
                            <div className="flex items-center">
                                {[...Array(fullStars)].map((_, i) => (
                                    <svg key={`full-${i}`} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.16c.969 0 1.371 1.24.588 1.81l-3.363 2.44a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.363-2.44a1 1 0 00-1.175 0l-3.363 2.44c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.404 9.384c-.783-.57-.38-1.81.588-1.81h4.16a1 1 0 00.95-.69l1.286-3.957z" />
                                    </svg>
                                ))}
                                {[...Array(emptyStars)].map((_, i) => (
                                    <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.16c.969 0 1.371 1.24.588 1.81l-3.363 2.44a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.363-2.44a1 1 0 00-1.175 0l-3.363 2.44c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.404 9.384c-.783-.57-.38-1.81.588-1.81h4.16a1 1 0 00.95-.69l1.286-3.957z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="ml-2 text-gray-600 text-sm">{reviewCount} Reviews</span>
                        </div>
                    )}
                    <h1 className="text-4xl font-extrabold text-gray-800 mb-4">{product.name}</h1>
                    <p className="text-3xl text-pink-500 font-bold mb-6">${product.price.toFixed(2)}</p>

                    <div className="flex items-center space-x-4 mb-6">
                        <label htmlFor="quantity" className="font-bold">Quantity:</label>
                        <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="border border-gray-300 rounded-md p-2 w-20 text-center"
                        />
                    </div>
                    {message && <p className="text-green-500 mb-4">{message}</p>}
                    <div className="flex space-x-4">
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-600 transition duration-300"
                        >
                            Add to Cart
                        </button>
                        <button
                            onClick={handleOrderNow}
                            className="w-full bg-gray-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-900 transition duration-300"
                        >
                            Order Now
                        </button>
                    </div>
                    <button
                        onClick={() => navigate('/products')}
                        className="w-full mt-4 bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition duration-300"
                    >
                        Keep Shopping
                    </button>

                    {/* Why Choose Us Section */}
                    <div className="mt-8 border-t pt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                            <div className="flex flex-col items-center p-2">
                                <svg className="w-10 h-10 text-pink-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h4 className="font-semibold text-gray-800">Premium Quality</h4>
                                <p className="text-sm text-gray-600">Only the best ingredients for your skin.</p>
                            </div>
                            <div className="flex flex-col items-center p-2">
                                <svg className="w-10 h-10 text-pink-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.875a3.375 3.375 0 003.375-3.375h1.5a1.125 1.125 0 011.125 1.125v-1.5a3.375 3.375 0 00-3.375-3.375H3.375" />
                                </svg>
                                <h4 className="font-semibold text-gray-800">Fast Shipping</h4>
                                <p className="text-sm text-gray-600">Quick delivery to your doorstep.</p>
                            </div>
                            <div className="flex flex-col items-center p-2">
                                <svg className="w-10 h-10 text-pink-500 mb-2" xmlns="http://www.w3.org/2000/.svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z" />
                                </svg>
                                <h4 className="font-semibold text-gray-800">Excellent Support</h4>
                                <p className="text-sm text-gray-600">We're here to help you 24/7.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description and Reviews Section with Tabs */}
            <div className="mt-16">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('description')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${
                                activeTab === 'description'
                                    ? 'border-pink-500 text-pink-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Description
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg ${
                                activeTab === 'reviews'
                                    ? 'border-pink-500 text-pink-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Reviews ({reviewCount})
                        </button>
                    </nav>
                </div>

                <div className="mt-8">
                    {activeTab === 'description' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 sr-only">Product Description</h2>
                            <div
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 sr-only">Customer Reviews</h2>
                            <div className="space-y-6">
                                {product.comments && product.comments.length > 0 ? (
                                    product.comments.map(comment => (
                                        <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-700 italic">"{comment.content}"</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <div className="text-yellow-500" aria-label={`Rating: ${comment.score} out of 5 stars`}>
                                                    {'★'.repeat(comment.score)}
                                                    {'☆'.repeat(5 - comment.score)}
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    - <span className="font-semibold">{comment.userFullName}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No reviews yet.</p>
                                )}
                            </div>
                            <CommentForm productId={id} onCommentAdded={handleCommentAdded} />
                        </div>
                    )}
                </div>
            </div>

            {/* Bestsellers Section */}
            <div className="mt-16 border-t border-gray-200">
                <ProductSlider title="Our Best Sellers" products={bestsellers} />
            </div>
        </div>
    );
};

export default ProductDetailPage;