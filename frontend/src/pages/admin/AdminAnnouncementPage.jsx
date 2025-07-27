import React, { useState, useEffect } from 'react';
import { getAnnouncement, updateAnnouncement } from '../../api/apiService';
import { toast } from 'react-toastify';

const AdminAnnouncementPage = () => {
    const [announcement, setAnnouncement] = useState({
        text: '',
        backgroundColor: '#ef4444',
        textColor: '#ffffff',
        enabled: false,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const { data } = await getAnnouncement();
                setAnnouncement(data);
            } catch (error) {
                toast.error('Failed to load announcement data.');
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncement();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAnnouncement(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateAnnouncement(announcement);
            toast.success('Announcement updated successfully!');
        } catch (error) {
            toast.error('Failed to update announcement.');
        }
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Manage Announcement Bar</h1>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <div>
                    <label htmlFor="text" className="block text-sm font-medium text-gray-700">Text</label>
                    <input
                        type="text"
                        name="text"
                        id="text"
                        value={announcement.text}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700">Background Color</label>
                        <input
                            type="color"
                            name="backgroundColor"
                            id="backgroundColor"
                            value={announcement.backgroundColor}
                            onChange={handleChange}
                            className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm"
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="textColor" className="block text-sm font-medium text-gray-700">Text Color</label>
                        <input
                            type="color"
                            name="textColor"
                            id="textColor"
                            value={announcement.textColor}
                            onChange={handleChange}
                            className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm"
                        />
                    </div>
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="enabled"
                        id="enabled"
                        checked={announcement.enabled}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900">Enable Announcement Bar</label>
                </div>
                <div>
                    <button
                        type="submit"
                        className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminAnnouncementPage;