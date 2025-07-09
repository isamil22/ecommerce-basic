import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPacks } from '../../api/apiService';
import Loader from '../../components/Loader';

const AdminPacksPage = () => {
    const [packs, setPacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPacks = async () => {
            try {
                const response = await getAllPacks();
                setPacks(response.data);
            } catch (err) {
                setError('Failed to fetch packs.');
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
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Packs</h1>
                <Link to="/admin/packs/new" className="bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700">
                    Add New Pack
                </Link>
            </div>
            {packs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packs.map((pack) => (
                        <div key={pack.id} className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold">{pack.name}</h2>
                            <p className="text-gray-600">{pack.description}</p>
                            <p className="text-lg font-bold text-pink-500">${pack.price.toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No packs found.</p>
            )}
        </div>
    );
};

export default AdminPacksPage;