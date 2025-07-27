import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPacks } from '../api/apiService'; // Make sure this function exists in your apiService
import Loader from '../components/Loader';
import CountdownBar from '../components/CountdownBar';

// A new component for displaying a single pack card
const PackCard = ({ pack }) => {
    const imageUrl = pack.imageUrl || 'https://placehold.co/600x400/fde4f2/E91E63?text=Our+Pack';

    return (
        <Link to={`/packs/${pack.id}`} className="block group border rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="overflow-hidden">
                <img
                    src={imageUrl}
                    alt={pack.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
            </div>
            <div className="p-4 bg-white">
                <h3 className="text-xl font-bold text-gray-800 truncate">{pack.name}</h3>
                <p className="text-gray-600 mt-2 h-20 overflow-hidden">{pack.description}</p>
                <div className="flex justify-between items-center mt-4">
                    <p className="text-2xl font-extrabold text-pink-500">${pack.price.toFixed(2)}</p>
                    <span className="bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg group-hover:bg-pink-700 transition-colors">
                        View Details
                    </span>
                </div>
            </div>
        </Link>
    );
};


const PacksPage = () => {
    const [packs, setPacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPacks = async () => {
            try {
                // Ensure getAllPacks function exists and fetches from '/api/packs'
                const response = await getAllPacks();
                setPacks(response.data);
            } catch (err) {
                console.error("Failed to fetch packs:", err);
                setError('Could not load the available packs. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchPacks();
    }, []);

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <p className="text-center text-red-500 mt-10">{error}</p>;
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <CountdownBar />
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-800">Explore Our Curated Packs</h1>
                <p className="text-lg text-gray-600 mt-2">Get the best value with our specially selected product bundles.</p>
            </div>

            {packs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {packs.map(pack => (
                        <PackCard key={pack.id} pack={pack} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 mt-10">No packs are available at the moment. Please check back soon!</p>
            )}
        </div>
    );
};

export default PacksPage;
