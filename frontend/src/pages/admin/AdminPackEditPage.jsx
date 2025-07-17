// src/pages/admin/AdminPackEditPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPackById, updatePack, getAllProducts } from '../../api/apiService';
import Loader from '../../components/Loader';

const AdminPackEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [packData, setPackData] = useState(null);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPackAndProducts = async () => {
            try {
                // Fetch both the pack to edit and the list of all products concurrently
                const [packResponse, productsResponse] = await Promise.all([
                    getPackById(id),
                    getAllProducts()
                ]);

                const fetchedPack = packResponse.data;
                const productsArray = productsResponse.data.content || [];

                setProducts(productsArray);

                // Set the form data from the fetched pack
                setPackData({
                    name: fetchedPack.name,
                    description: fetchedPack.description,
                    price: fetchedPack.price,
                    items: fetchedPack.items.map(item => ({
                        // Ensure IDs are correctly mapped for the request
                        defaultProductId: item.defaultProduct.id,
                        variationProductIds: item.variationProducts.map(vp => vp.id)
                    }))
                });

                if (fetchedPack.imageUrl) {
                    setImagePreview(fetchedPack.imageUrl);
                }

            } catch (err) {
                setError('Failed to fetch data. The pack may not exist.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPackAndProducts();
    }, [id]);

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
            items: [...packData.items, { defaultProductId: '', variationProductIds: [] }]
        });
    };

    const removeItem = (index) => {
        const newItems = packData.items.filter((_, i) => i !== index);
        setPackData({ ...packData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const formData = new FormData();
        // The backend expects a JSON string part named 'pack'
        formData.append('pack', new Blob([JSON.stringify(packData)], { type: 'application/json' }));

        // Append the new image only if one was selected
        if (image) {
            formData.append('image', image);
        }

        try {
            await updatePack(id, formData);
            navigate('/admin/packs'); // Redirect to the packs list on success
        } catch (err) {
            setError('Failed to update pack. Please check your inputs.');
            console.error(err);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Pack</h2>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}

            {packData && (
                <form onSubmit={handleSubmit}>
                    {/* Form fields are similar to AdminPackForm, pre-filled with packData */}
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input type="text" name="name" id="name" value={packData.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" required />
                    </div>
                    {/* ... other fields like description, price ... */}

                    <div className="mb-4">
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700">Update Pack Image (Optional)</label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            onChange={handleImageChange}
                            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                            accept="image/*"
                        />
                    </div>
                    {imagePreview && (
                        <div className="mb-6">
                            <p className="block text-sm font-medium text-gray-700">Image Preview:</p>
                            <img src={imagePreview} alt="Pack preview" className="mt-2 h-48 w-auto rounded-lg border p-1" />
                        </div>
                    )}

                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Pack Items</h3>
                    {packData.items.map((item, index) => (
                        <div key={index} className="p-4 border rounded-md mb-4 relative bg-gray-50">
                            <button type="button" onClick={() => removeItem(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">&times;</button>
                            <div className="mb-2">
                                <label className="block text-sm font-medium text-gray-700">Default Product</label>
                                <select value={item.defaultProductId} onChange={(e) => handleItemChange(index, 'defaultProductId', e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" required>
                                    <option value="">Select Default Product</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Variation Products</label>
                                <select multiple value={item.variationProductIds} onChange={(e) => handleItemChange(index, 'variationProductIds', Array.from(e.target.selectedOptions, option => option.value))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500">
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addItem} className="mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Add Another Item</button>

                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300">
                        Save Changes
                    </button>
                </form>
            )}
        </div>
    );
};

export default AdminPackEditPage;