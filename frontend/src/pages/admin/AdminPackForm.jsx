import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProducts, createPack } from '../../api/apiService';
import Loader from '../../components/Loader';

const AdminPackForm = () => {
    const [pack, setPack] = useState({
        name: '',
        description: '',
        price: '',
        items: []
    });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await getAllProducts();
                const productsArray = Array.isArray(response.data) ? response.data : response.data.content;
                setProducts(productsArray || []);
            } catch (err) {
                setError('Failed to fetch products.');
                console.error("Fetch Products Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPack((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...pack.items];
        newItems[index][field] = value;
        setPack(prev => ({ ...prev, items: newItems }));
    };

    const handleVariationChange = (itemIndex, productId) => {
        const newItems = [...pack.items];
        const currentVariations = newItems[itemIndex].variationProductIds || [];
        const newVariations = currentVariations.includes(productId)
            ? currentVariations.filter(id => id !== productId)
            : [...currentVariations, productId];
        newItems[itemIndex].variationProductIds = newVariations;
        setPack(prev => ({ ...prev, items: newItems }));
    };

    const addProductToPack = () => {
        setPack(prev => ({
            ...prev,
            items: [...prev.items, { defaultProductId: '', variationProductIds: [] }]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const packRequestDTO = {
            name: pack.name,
            description: pack.description,
            price: parseFloat(pack.price),
            items: pack.items.map(item => ({
                defaultProductId: item.defaultProductId,
                variationProductIds: item.variationProductIds || []
            }))
        };

        try {
            await createPack(packRequestDTO);
            navigate('/admin/packs');
        } catch (err) {
            console.error('Failed to create pack:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'An error occurred. Check the console for details.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Create Pack</h1>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
                {error && <p className="text-red-500 text-center bg-red-100 p-3 rounded-md">{error}</p>}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" id="name" name="name" value={pack.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea id="description" name="description" value={pack.description} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                    <input type="number" step="0.01" id="price" name="price" value={pack.price} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                </div>

                <hr />

                <h2 className="text-2xl font-bold">Pack Items</h2>
                {pack.items.map((item, index) => (
                    <div key={index} className="border p-4 rounded-md space-y-4">
                        <div>
                            <label htmlFor={`defaultProduct-${index}`} className="block text-sm font-medium text-gray-700">Default Product</label>
                            <select id={`defaultProduct-${index}`} value={item.defaultProductId} onChange={(e) => handleItemChange(index, 'defaultProductId', e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500">
                                <option value="">-- Select a Default Product --</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>{product.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Variation Products</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                {products.map(product => (
                                    <div key={product.id} className="flex items-center">
                                        <input type="checkbox" id={`variation-${index}-${product.id}`}
                                               checked={(item.variationProductIds || []).includes(product.id)}
                                               onChange={() => handleVariationChange(index, product.id)}
                                               className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                                        />
                                        <label htmlFor={`variation-${index}-${product.id}`} className="ml-2 block text-sm text-gray-900">{product.name}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addProductToPack} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300">Add Another Product</button>

                <hr />

                <div>
                    <button type="submit" className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500" disabled={loading}>
                        {loading ? 'Saving...' : 'Create Pack'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminPackForm;