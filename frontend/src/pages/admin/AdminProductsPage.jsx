import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts, deleteProduct } from '../../api/apiService';

const AdminProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');

    const fetchProducts = async () => {
        try {
            const response = await getAllProducts();
            setProducts(response.data.content || response.data);
        } catch (err) {
            setError('Failed to fetch products.');
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id);
                fetchProducts(); // Refresh list after deleting
            } catch (err) {
                setError('Failed to delete product.');
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Products</h1>
                <Link to="/admin/products/new" className="bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700">
                    Add New Product
                </Link>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <div className="bg-white p-4 rounded-lg shadow-md">
                <ul className="space-y-3">
                    {products.map(product => (
                        <li key={product.id} className="flex justify-between items-center p-3 border-b">
                            <div>
                                <p className="font-semibold">{product.name}</p>
                                <p className="text-sm text-gray-600">Stock: {product.quantity}</p>
                            </div>
                            <div className="space-x-3">
                                <Link to={`/admin/products/edit/${product.id}`} className="text-blue-600 hover:underline">Edit</Link>
                                <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:underline">Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminProductsPage;