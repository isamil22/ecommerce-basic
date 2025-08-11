// frontend/src/pages/CustomPackCreationPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCustomPackById, getPackableProducts, addToCart } from '../api/apiService';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const CustomPackCreationPage = () => {
    const { id } = useParams();
    const [packInfo, setPackInfo] = useState(null);
    const [packableProducts, setPackableProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [packResponse, productsResponse] = await Promise.all([
                    getCustomPackById(id),
                    getPackableProducts()
                ]);
                setPackInfo(packResponse.data);
                setPackableProducts(productsResponse.data);
            } catch (error) {
                toast.error('Failed to load pack details.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if (!packInfo) return;

        if (packInfo.pricingType === 'FIXED') {
            setTotalPrice(packInfo.fixedPrice);
        } else {
            const subtotal = selectedProducts.reduce((total, product) => total + product.price, 0);
            const discount = subtotal * (packInfo.discountRate || 0);
            setTotalPrice(subtotal - discount);
        }
    }, [selectedProducts, packInfo]);

    const handleProductSelect = (product) => {
        setSelectedProducts(prevSelected => {
            if (prevSelected.find(p => p.id === product.id)) {
                return prevSelected.filter(p => p.id !== product.id);
            }
            if (prevSelected.length < packInfo.maxItems) {
                return [...prevSelected, product];
            }
            toast.warn(`You can select a maximum of ${packInfo.maxItems} items.`);
            return prevSelected;
        });
    };

    const handleAddToCart = async () => {
        if (selectedProducts.length < packInfo.minItems) {
            toast.error(`You must select at least ${packInfo.minItems} items.`);
            return;
        }

        try {
            for (const product of selectedProducts) {
                await addToCart(product.id, 1);
            }
            toast.success('Custom pack added to cart!');
        } catch (error) {
            toast.error('Failed to add items to cart.');
        }
    };

    if (loading) return <Loader />;
    if (!packInfo) return <p className="text-center">Pack not found.</p>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">{packInfo.name}</h1>
            <p className="text-lg text-gray-600 mb-6">{packInfo.description}</p>
            <p className="mb-4">Select between {packInfo.minItems} and {packInfo.maxItems} items.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {packableProducts.map(product => (
                    <div
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className={`border-2 p-4 rounded-lg cursor-pointer ${selectedProducts.find(p => p.id === product.id) ? 'border-pink-500' : 'border-gray-300'}`}
                    >
                        <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover mb-4" />
                        <h3 className="font-bold">{product.name}</h3>
                        <p>${product.price.toFixed(2)}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <h2 className="text-2xl font-bold">Total: ${totalPrice.toFixed(2)}</h2>
                <button
                    onClick={handleAddToCart}
                    className="mt-4 bg-pink-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-700"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default CustomPackCreationPage;