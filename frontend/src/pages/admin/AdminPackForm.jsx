// frontend/src/pages/admin/AdminPackForm.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPack, getAllProducts } from '../../api/apiService';
import Loader from '../../components/Loader';

const AdminPackForm = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [packData, setPackData] = useState({
        name: '',
        description: '',
        price: '',
        items: [{ defaultProductId: '', variationProductIds: [] }],
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Assuming getAllProducts returns an object with a data.content array
                const response = await getAllProducts();
                setProducts(response.data.content || []);
            } catch (err) {
                setError('Failed to fetch products. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPackData({ ...packData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...packData.items];
        newItems[index][field] = value;
        setPackData({ ...packData, items: newItems });
    };

    const addItem = () => {
        setPackData({
            ...packData,
            items: [...packData.items, { defaultProductId: '', variationProductIds: [] }],
        });
    };

    const removeItem = (index) => {
        const newItems = packData.items.filter((_, i) => i !== index);
        setPackData({ ...packData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation to ensure a default product is selected for each item
        for (const item of packData.items) {
            if (!item.defaultProductId) {
                setError('Each pack item must have a default product selected.');
                return;
            }
        }

        const formData = new FormData();
        // The backend expects a JSON string for the 'pack' part
        formData.append('pack', new Blob([JSON.stringify(packData)], { type: 'application/json' }));

        if (image) {
            formData.append('image', image);
        }

        setLoading(true);
        try {
            await createPack(formData);
            navigate('/admin/packs'); // Navigate back to the pack list on success
        } catch (err) {
            setError('Failed to create pack. Please check the form fields.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Pack</h2>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" name="name" id="name" value={packData.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" required />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" id="description" value={packData.description} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" required />
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                    <input type="number" name="price" id="price" value={packData.price} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" required />
                </div>
                <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">Pack Image</label>
                    <input type="file" id="image" name="image" onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" accept="image/*" />
                </div>
                {imagePreview && (
                    <div>
                        <p className="block text-sm font-medium text-gray-700">Image Preview:</p>
                        <img src={imagePreview} alt="Pack preview" className="mt-2 h-48 w-auto rounded-lg border p-1" />
                    </div>
                )}
                <hr />
                <h3 className="text-xl font-semibold text-gray-700">Pack Items</h3>
                {packData.items.map((item, index) => (
                    <div key={index} className="p-4 border rounded-md mb-4 relative bg-gray-50">
                        <button type="button" onClick={() => removeItem(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
                        <div className="mb-2">
                            <label className="block text-sm font-medium text-gray-700">Default Product</label>
                            <select value={item.defaultProductId} onChange={(e) => handleItemChange(index, 'defaultProductId', e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" required>
                                <option value="">-- Select Default Product --</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Variation Products (Optional)</label>
                            <select multiple value={item.variationProductIds} onChange={(e) => handleItemChange(index, 'variationProductIds', Array.from(e.target.selectedOptions, option => option.value))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500">
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addItem} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Add Another Item</button>
                <button type="submit" className="w-full bg-pink-600 text-white font-bold py-3 px-4 rounded-md hover:bg-pink-700 transition duration-300">
                    Create Pack
                </button>
            </form>
        </div>
    );
};

export default AdminPackForm;