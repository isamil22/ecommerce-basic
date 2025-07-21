import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../../api/settingsService';
import { toast } from 'react-toastify';

const SettingsPage = () => {
    const [pixelId, setPixelId] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await getSettings();
                if (settings.facebookPixelId) {
                    setPixelId(settings.facebookPixelId);
                }
            } catch (err) {
                toast.error('Failed to load settings.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            await saveSettings({ facebookPixelId: pixelId });
            toast.success('Settings saved successfully!');
        } catch (err) {
            toast.error('Failed to save settings. You must be an admin.');
        }
    };

    if (isLoading) {
        return <div className="text-center p-8">Loading settings...</div>;
    }

    return (
        <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg mt-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Application Settings</h1>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Analytics</h2>
                <div className="p-4 border rounded-md">
                    <label htmlFor="pixelId" className="block text-sm font-medium text-gray-600 mb-2">
                        Facebook Pixel ID
                    </label>
                    <input
                        type="text"
                        id="pixelId"
                        value={pixelId}
                        onChange={(e) => setPixelId(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                        placeholder="Enter your Facebook Pixel ID"
                    />
                    <p className="text-xs text-gray-500 mt-2">This ID will be used to track user activity for marketing purposes.</p>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-pink-600 text-white font-semibold rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors duration-300"
                >
                    Save Settings
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
