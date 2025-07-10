import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPack, getAllProducts } from '../../api/apiService';

const AdminPackForm = () => {
    const [packData, setPackData] = useState({
        name: '',
        description: '',
        price: '',
        items: [{ defaultProductId: '', variationProductIds: [] }]
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getAllProducts();
                setProducts(response.data.products);
            } catch (err) {
                setError('Failed to fetch products.');
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

        // Append the pack data as a JSON string under the key "pack"
        formData.append('pack', new Blob([JSON.stringify(packData)], { type: 'application/json' }));

        // Append the image file under the key "image"
        if (image) {
            formData.append('image', image);
        } else {
            setError('Please select an image for the pack.');
            return;
        }

        try {
            await createPack(formData);
            navigate('/admin/packs');
        } catch (err) {
            setError('Failed to create pack. Please check your inputs.');
            console.error(err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Pack</h2>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
                {/* Standard form fields */}
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" name="name" id="name" value={packData.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" required />
                </div>
                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" id="description" value={packData.description} onChange={handleInputChange} rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" required></textarea>
                </div>
                <div className="mb-4">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                    <input type="number" name="price" id="price" value={packData.price} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" required />
                </div>

                {/* NEW: Image Upload Field and Preview */}
                <div className="mb-4">
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">Pack Image</label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        onChange={handleImageChange}
                        className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                        accept="image/*"
                        required
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
                <button type="button" onClick={addItem} className="mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Add Another Product</button>

                <button type="submit" className="w-full bg-pink-600 text-white font-bold py-3 px-4 rounded-md hover:bg-pink-700 transition duration-300">
                    Create Pack
                </button>
            </form>
        </div>
    );
};

export default AdminPackForm;