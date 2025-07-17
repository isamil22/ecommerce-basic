// frontend/src/pages/admin/AdminPacksPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPacks, deletePack } from '../../api/apiService'; // Correct path
import Loader from '../../components/Loader'; // Correct path

const AdminPacksPage = () => {
    const [packs, setPacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    useEffect(() => {
        fetchPacks();
    }, []);

    const handleDelete = async (packId) => {
        if (window.confirm('Are you sure you want to delete this pack?')) {
            try {
                await deletePack(packId);
                fetchPacks(); // Refresh the list
            } catch (err) {
                setError('Failed to delete pack.');
            }
        }
    };


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
            {packs && packs.length > 0 ? (
                <div className="bg-white shadow-md rounded-lg">
                    <ul className="divide-y divide-gray-200">
                        {packs.map((pack) => (
                            <li key={pack.id} className="p-4 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">{pack.name}</h2>
                                    <p className="text-gray-600">
                                        {pack.price != null ? `$${pack.price.toFixed(2)}` : 'No price'}
                                    </p>
                                </div>
                                <div className="space-x-4">
                                    <Link
                                        to={`/admin/packs/edit/${pack.id}`}
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(pack.id)}
                                        className="text-red-600 hover:text-red-800 font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>No packs found.</p>
            )}
        </div>
    );
};

export default AdminPacksPage;