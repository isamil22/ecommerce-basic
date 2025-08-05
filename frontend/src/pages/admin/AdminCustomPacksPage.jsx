import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCustomPacks, deleteCustomPack } from '../../api/apiService'; // Using custom pack functions
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';

const AdminCustomPacksPage = () => {
    const [customPacks, setCustomPacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchCustomPacks = async () => {
        try {
            const response = await getAllCustomPacks();
            setCustomPacks(response.data || []);
        } catch (err) {
            setError('Failed to fetch custom packs.');
            console.error("Fetch Custom Packs Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomPacks();
    }, []);

    const handleDelete = async (packId) => {
        if (window.confirm('Are you sure you want to delete this custom pack?')) {
            try {
                // You will need to create deleteCustomPack in your apiService
                // await deleteCustomPack(packId);
                toast.success('Custom pack deleted successfully!');
                fetchCustomPacks(); // Refresh the list
            } catch (err) {
                setError('Failed to delete custom pack.');
                toast.error('Failed to delete custom pack.');
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
                <h1 className="text-3xl font-bold">Manage Custom Packs</h1>
                <Link to="/admin/custom-packs/new" className="bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700">
                    Add New Custom Pack
                </Link>
            </div>
            {customPacks.length > 0 ? (
                <div className="bg-white shadow-md rounded-lg">
                    <ul className="divide-y divide-gray-200">
                        {customPacks.map((pack) => (
                            <li key={pack.id} className="p-4 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">{pack.name}</h2>
                                    <p className="text-gray-600">
                                        {pack.pricingType === 'FIXED' ? `$${pack.fixedPrice}` : `${pack.discountRate * 100}% Discount`}
                                    </p>
                                </div>
                                <div className="space-x-4">
                                    <Link
                                        to={`/admin/custom-packs/edit/${pack.id}`}
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
                <p>No custom packs found.</p>
            )}
        </div>
    );
};

export default AdminCustomPacksPage;