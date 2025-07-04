import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBestsellers, getNewArrivals, getApprovedReviews, getAllCategories, getHero } from '../api/apiService';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
    const [bestsellers, setBestsellers] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [hero, setHero] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    bestsellersResponse,
                    newArrivalsResponse,
                    reviewsResponse,
                    categoriesResponse,
                    heroResponse
                ] = await Promise.all([
                    getBestsellers(),
                    getNewArrivals(),
                    getApprovedReviews(),
                    getAllCategories(),
                    getHero()
                ]);

                const bestsellersArray = Array.isArray(bestsellersResponse.data) ? bestsellersResponse.data : bestsellersResponse.data.content;
                setBestsellers(bestsellersArray);

                const newArrivalsArray = Array.isArray(newArrivalsResponse.data) ? newArrivalsResponse.data : newArrivalsResponse.data.content;
                setNewArrivals(newArrivalsArray);

                setReviews(reviewsResponse.data);
                setCategories(categoriesResponse.data);
                setHero(heroResponse.data);

            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Could not fetch data from the server.");
            }
        };
        fetchData();
    }, []);

    // Helper function to render stars
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push(<span key={i} className="text-yellow-400">&#9733;</span>); // Filled star
            } else {
                stars.push(<span key={i} className="text-gray-300">&#9733;</span>); // Empty star
            }
        }
        return <div className="flex items-center">{stars}</div>;
    };

    // Use the S3 URL directly
    const heroImageUrl = hero?.imageUrl;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* --- Hero Section --- */}
            {hero && (
                <div
                    className="relative rounded-lg p-12 md:p-20 mb-16 text-center text-white overflow-hidden bg-cover bg-center"
                    style={{ backgroundImage: `url(${heroImageUrl})` }}
                >
                    <div className="absolute inset-0 bg-black opacity-40"></div>
                    <div className="relative z-10">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">{hero.title}</h1>
                        <p className="text-lg mb-6">{hero.subtitle}</p>
                        <Link to={hero.linkUrl} className="bg-white text-pink-500 font-bold py-3 px-8 rounded-full hover:bg-pink-100 transition-colors">
                            {hero.linkText}
                        </Link>
                    </div>
                </div>
            )}

            {/* --- ENHANCED Shop By Category Section --- */}
            <div className="mb-16">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Shop by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {categories.map(category => (
                        <Link
                            key={category.id}
                            to={`/products?categoryId=${category.id}`}
                            className="group relative block bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden aspect-square"
                        >
                            <img
                                // Use the S3 URL directly
                                src={category.imageUrl || `https://placehold.co/400x400/fde4f2/E91E63?text=${encodeURIComponent(category.name)}`}
                                alt={category.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center p-4 transition-all duration-300 group-hover:bg-opacity-60">
                                <p className="font-semibold text-white text-xl text-center">{category.name}</p>
                                <p className="text-sm text-center text-gray-200 max-w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2 px-2">
                                    {category.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {error && <p className="text-red-500 text-center">{error}</p>}

            {/* --- Bestsellers Section --- */}
            <h2 className="text-3xl font-bold text-center text-pink-500 mb-8">Bestselling Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {bestsellers.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {/* --- New Arrivals Section --- */}
            <div className="mt-16">
                <h2 className="text-3xl font-bold text-center text-pink-500 mb-8">New Arrivals</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {newArrivals.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>

            {/* --- Reviews Section --- */}
            <div className="mt-16">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">What Our Customers Say</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map(review => (
                        <div key={review.id} className="bg-white p-6 rounded-lg shadow-md">
                            <p className="text-gray-600 mb-4">"{review.content}"</p> {/* Added mb-4 for spacing */}
                            <div className="mt-auto"> {/* Use mt-auto to push content to the bottom if the card height varies */}
                                <p className="font-semibold text-pink-500">{review.userEmail}</p>
                                {/* Display stars using the helper function */}
                                {renderStars(review.rating)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage;


