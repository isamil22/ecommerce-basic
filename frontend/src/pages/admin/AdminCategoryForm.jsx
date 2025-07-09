import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createCategory, updateCategory, getAllCategories } from '../../api/apiService'; // Assuming getCategoryById exists or fetching all and filtering

const AdminCategoryForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState({ name: '', description: '' });
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (id) {
            const fetchCategory = async () => {
                try {
                    // Note: You might need to implement a getCategoryById in your apiService and backend
                    // For now, we fetch all and find the one to edit.
                    const response = await getAllCategories();
                    const categoryToEdit = response.data.find(cat => cat.id.toString() === id);
                    if (categoryToEdit) {
                        setCategory(categoryToEdit);
                    } else {
                        setError('Category not found.');
                    }
                } catch (err) {
                    setError('Failed to load category data.');
                }
            };
            fetchCategory();
        }
    }, [id]);

    const handleChange = (e) => {
        setCategory(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('category', new Blob([JSON.stringify(category)], { type: 'application/json' }));
        if (image) {
            formData.append('image', image);
        }

        setError('');
        setSuccess('');

        try {
            if (id) {
                await updateCategory(id, formData);
                setSuccess('Category updated successfully!');
            } else {
                await createCategory(formData);
                setSuccess('Category created successfully!');
            }
            setTimeout(() => navigate('/admin/categories'), 2000);
        } catch (err) {
            setError('Operation failed. Please try again.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">{id ? 'Edit Category' : 'Create Category'}</h1>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md">
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" name="name" id="name" value={category.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" id="description" value={category.description} onChange={handleChange} rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"></textarea>
                </div>
                <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">Category Image</label>
                    <input type="file" name="image" id="image" onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
                </div>
                <div>
                    <button type="submit" className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700">{id ? 'Update' : 'Create'}</button>
                </div>
            </form>
        </div>
    );
};

export default AdminCategoryForm;