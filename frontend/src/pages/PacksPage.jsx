import React, { useState, useEffect } from 'react';
import { getAllPacks } from '../api/apiService';
import Loader from '../components/Loader';
import PackCard from '../components/PackCard';

const PacksPage = () => {
    const [packs, setPacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPacks = async () => {
            try {
                const response = await getAllPacks();
                const packsArray = Array.isArray(response.data) ? response.data : response.data.content;

                if (Array.isArray(packsArray)) {
                    setPacks(packsArray);
                } else {
                    setError('Received invalid data from server.');
                }

            } catch (err) {
                setError('Failed to fetch packs.');
                console.error("Fetch Packs Error:", err);
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
        return <p className="text-center mt-10 text-red-500">{error}</p>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Our Packs</h1>
            {packs && packs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packs.map((pack) => (
                        <PackCard key={pack.id} pack={pack} />
                    ))}
                </div>
            ) : (
                <p>No packs found.</p>
            )}
        </div>
    );
};

export default PacksPage;