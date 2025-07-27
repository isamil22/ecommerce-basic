import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../../api/visitorCountSettingService';
import { toast } from 'react-toastify';

const VisitorCounterSettingsPage = () => {
    const [settings, setSettings] = useState({
        enabled: false,
        min: 10,
        max: 50,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getSettings();
                setSettings({
                    enabled: data.enabled || false,
                    min: parseInt(data.min, 10) || 10,
                    max: parseInt(data.max, 10) || 50,
                });
            } catch (err) {
                toast.error('Failed to load settings.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            await saveSettings(settings);
            toast.success('Visitor counter settings saved successfully!');
        } catch (err) {
            toast.error('Failed to save settings. You must be an admin.');
        }
    };

    if (isLoading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Manage Visitor Counter</h1>
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="enabled"
                        id="visitorCounterEnabled"
                        checked={settings.enabled}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <label htmlFor="visitorCounterEnabled" className="ml-2 block text-sm text-gray-900">Enable Visitor Counter</label>
                </div>

                {settings.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="min" className="block text-sm font-medium text-gray-700">Minimum Visitors</label>
                            <input
                                type="number"
                                name="min"
                                id="min"
                                value={settings.min}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                min="1"
                            />
                        </div>
                        <div>
                            <label htmlFor="max" className="block text-sm font-medium text-gray-700">Maximum Visitors</label>
                            <input
                                type="number"
                                name="max"
                                id="max"
                                value={settings.max}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                                min={settings.min}
                            />
                        </div>
                    </div>
                )}

                <div>
                    <button
                        type="submit"
                        className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VisitorCounterSettingsPage;