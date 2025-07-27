import React, { useState, useEffect } from 'react';
import { getCountdown, saveCountdown } from '../../api/apiService';

const AdminCountdownPage = () => {
    const [title, setTitle] = useState('');
    const [endDate, setEndDate] = useState('');
    const [enabled, setEnabled] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState('#000000');
    const [textColor, setTextColor] = useState('#ffffff');
    const [message, setMessage] = useState('');

    useEffect(() => {
        getCountdown().then(response => {
            if (response.data) {
                const data = response.data;
                setTitle(data.title);
                setEndDate(data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : '');
                setEnabled(data.enabled);
                setBackgroundColor(data.backgroundColor);
                setTextColor(data.textColor);
            }
        }).catch(error => console.error("Could not fetch countdown settings", error));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const countdownData = {
            title,
            endDate: new Date(endDate).toISOString(),
            enabled,
            backgroundColor,
            textColor,
        };
        saveCountdown(countdownData)
            .then(() => {
                setMessage('Settings saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            })
            .catch(() => {
                setMessage('Error saving settings.');
                setTimeout(() => setMessage(''), 3000);
            });
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Countdown Timer Settings</h1>
            {message && <p className="text-blue-500">{message}</p>}
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                    <input type="datetime-local" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500" />
                </div>
                <div>
                    <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700">Background Color</label>
                    <input type="color" id="backgroundColor" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label htmlFor="textColor" className="block text-sm font-medium text-gray-700">Text Color</label>
                    <input type="color" id="textColor" value={textColor} onChange={e => setTextColor(e.target.value)} className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm" />
                </div>
                <div className="flex items-center">
                    <input type="checkbox" id="enabled" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500" />
                    <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900">Enable Countdown</label>
                </div>
                <div>
                    <button type="submit" className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700">Save Settings</button>
                </div>
            </form>
        </div>
    );
};

export default AdminCountdownPage;