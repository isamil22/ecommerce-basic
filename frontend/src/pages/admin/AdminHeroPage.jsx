import React, { useState, useEffect } from 'react';
import { getHero, updateHero } from '../../api/apiService';

const AdminHeroPage = () => {
    const [hero, setHero] = useState({ title: '', subtitle: '', linkText: '', linkUrl: '' });
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchHero = async () => {
            try {
                const response = await getHero();
                setHero(response.data);
            } catch (err) {
                setError('Failed to load hero data.');
            }
        };
        fetchHero();
    }, []);

    const handleChange = (e) => {
        setHero(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('hero', new Blob([JSON.stringify(hero)], { type: 'application/json' }));
        if (image) {
            formData.append('image', image);
        }

        setError('');
        setSuccess('');

        try {
            await updateHero(formData);
            setSuccess('Hero section updated successfully!');
        } catch (err) {
            setError('Operation failed. Please try again.');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Manage Hero Section</h1>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" name="title" id="title" value={hero.title} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                </div>
                <div>
                    <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">Subtitle</label>
                    <input type="text" name="subtitle" id="subtitle" value={hero.subtitle} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                </div>
                <div>
                    <label htmlFor="linkText" className="block text-sm font-medium text-gray-700">Link Text</label>
                    <input type="text" name="linkText" id="linkText" value={hero.linkText} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                </div>
                <div>
                    <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700">Link URL</label>
                    <input type="text" name="linkUrl" id="linkUrl" value={hero.linkUrl} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                </div>
                <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">Hero Image</label>
                    <input type="file" name="image" id="image" onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
                </div>
                <div>
                    <button type="submit" className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700">Update Hero Section</button>
                </div>
            </form>
        </div>
    );
};

export default AdminHeroPage;