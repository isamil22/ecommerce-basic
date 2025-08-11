// frontend/src/pages/CustomPacksPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCustomPacks } from '../api/apiService';
import Loader from '../components/Loader';

const CustomPacksPage = () => {
    const [customPacks, setCustomPacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCustomPacks = async () => {
            try {
                const response = await getAllCustomPacks();
                setCustomPacks(response.data);
            } catch (err) {
                setError('Failed to fetch custom packs.');
            } finally {
                setLoading(false);
            }
        };
        fetchCustomPacks();
    }, []);

    if (loading) return <Loader />;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Create Your Own Pack</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {customPacks.map((pack) => (
                    <Link key={pack.id} to={`/custom-packs/${pack.id}`} className="block border rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <h2 className="text-2xl font-bold">{pack.name}</h2>
                        <p className="text-gray-600">{pack.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CustomPacksPage;