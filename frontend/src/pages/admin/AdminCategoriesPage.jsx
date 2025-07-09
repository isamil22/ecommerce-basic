import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories, deleteCategory } from '../../api/apiService';

const AdminCategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');

    const fetchCategories = async () => {
        try {
            const response = await getAllCategories();
            setCategories(response.data);
        } catch (err) {
            setError('Failed to fetch categories.');
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await deleteCategory(id);
                fetchCategories(); // Refresh list
            } catch (err) {
                setError('Failed to delete category. It might be in use by some products.');
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Categories</h1>
                <Link to="/admin/categories/new" className="bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700">
                    Add New Category
                </Link>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <div className="bg-white p-4 rounded-lg shadow-md">
                <ul className="space-y-3">
                    {categories.map(category => (
                        <li key={category.id} className="flex justify-between items-center p-3 border-b">
                            <div className="flex items-center gap-4">
                                <img src={category.imageUrl} alt={category.name} className="w-16 h-16 object-cover rounded-md bg-gray-200" />
                                <p className="font-semibold">{category.name}</p>
                            </div>
                            <div className="space-x-3">
                                <Link to={`/admin/categories/edit/${category.id}`} className="text-blue-600 hover:underline">Edit</Link>
                                <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:underline">Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminCategoriesPage;