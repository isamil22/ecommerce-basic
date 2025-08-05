import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCustomPack, getCustomPackById, updateCustomPack } from '../../api/apiService'; // Import new functions
import { toast } from 'react-toastify';
import Loader from '../../components/Loader'; // Import Loader

const AdminCustomPackForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        minItems: '',
        maxItems: '',
        pricingType: 'FIXED',
        fixedPrice: '',
        discountRate: ''
    });
    const [loading, setLoading] = useState(false); // Add loading state
    const isEditing = Boolean(id);

    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            const fetchPackData = async () => {
                try {
                    const response = await getCustomPackById(id);
                    setFormData(response.data); // Populate form with fetched data
                } catch (error) {
                    toast.error('Failed to fetch custom pack data.');
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            };
            fetchPackData();
        }
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateCustomPack(id, formData); // Use update function
                toast.success('Custom pack updated successfully!');
            } else {
                await createCustomPack(formData);
                toast.success('Custom pack created successfully!');
            }
            navigate('/admin/custom-packs');
        } catch (error) {
            toast.error('Failed to save custom pack.');
            console.error(error);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">{isEditing ? 'Edit Custom Pack' : 'Create Custom Pack'}</h1>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                {/* Your form fields remain the same */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Pack Name</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="3" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="minItems" className="block text-sm font-medium text-gray-700">Min Items</label>
                        <input type="number" name="minItems" id="minItems" value={formData.minItems} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                    </div>
                    <div>
                        <label htmlFor="maxItems" className="block text-sm font-medium text-gray-700">Max Items</label>
                        <input type="number" name="maxItems" id="maxItems" value={formData.maxItems} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                    </div>
                </div>
                <div>
                    <label htmlFor="pricingType" className="block text-sm font-medium text-gray-700">Pricing Type</label>
                    <select name="pricingType" id="pricingType" value={formData.pricingType} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500">
                        <option value="FIXED">Fixed Price</option>
                        <option value="DYNAMIC">Dynamic Discount</option>
                    </select>
                </div>
                {formData.pricingType === 'FIXED' ? (
                    <div>
                        <label htmlFor="fixedPrice" className="block text-sm font-medium text-gray-700">Fixed Price</label>
                        <input type="number" step="0.01" name="fixedPrice" id="fixedPrice" value={formData.fixedPrice} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                    </div>
                ) : (
                    <div>
                        <label htmlFor="discountRate" className="block text-sm font-medium text-gray-700">Discount Rate (e.g., 0.20 for 20%)</label>
                        <input type="number" step="0.01" name="discountRate" id="discountRate" value={formData.discountRate} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                    </div>
                )}
                <div>
                    <button type="submit" className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700">{isEditing ? 'Update Pack' : 'Create Pack'}</button>
                </div>
            </form>
        </div>
    );
};

export default AdminCustomPackForm;