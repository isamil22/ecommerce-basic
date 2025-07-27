import React, { useState, useEffect } from 'react';
import { getAnnouncement, updateAnnouncement } from '../../api/apiService';
import { toast } from 'react-toastify';
import EmojiPicker from 'emoji-picker-react';

const AdminAnnouncementPage = () => {
    const [announcement, setAnnouncement] = useState({
        text: '',
        backgroundColor: '#ef4444',
        textColor: '#ffffff',
        enabled: false,
        animationType: 'none',
        isSticky: false,
        fontWeight: 'normal',
    });
    const [loading, setLoading] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const { data } = await getAnnouncement();
                setAnnouncement({
                    text: data.text || '',
                    backgroundColor: data.backgroundColor || '#ef4444',
                    textColor: data.textColor || '#ffffff',
                    enabled: data.enabled || false,
                    animationType: data.animationType || 'none',
                    isSticky: data.isSticky || false,
                    fontWeight: data.fontWeight || 'normal',
                });
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

    const onEmojiClick = (emojiObject) => {
        setAnnouncement(prev => ({ ...prev, text: prev.text + emojiObject.emoji }));
        setShowEmojiPicker(false);
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
                    <div className="mt-1 relative">
                        <input
                            type="text"
                            name="text"
                            id="text"
                            value={announcement.text}
                            onChange={handleChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 pr-10"
                            placeholder="Add your announcement text here..."
                        />
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-xl"
                            title="Add Emoji"
                        >
                            😊
                        </button>
                    </div>
                    {showEmojiPicker && (
                        <div className="absolute z-10 mt-2">
                            <EmojiPicker onEmojiClick={onEmojiClick} />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
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
                    <div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="animationType" className="block text-sm font-medium text-gray-700">Animation Type</label>
                        <select
                            name="animationType"
                            id="animationType"
                            value={announcement.animationType}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                        >
                            <option value="none">None</option>
                            <optgroup label="Professional & Subtle">
                                <option value="pulse-custom">Pulse</option>
                                <option value="text-glow">Text Glow</option>
                                <option value="gradient-pan">Gradient Shift</option>
                            </optgroup>
                            <optgroup label="Attention-Grabbing">
                                <option value="shake-custom">Shake</option>
                                <option value="bounce-custom">Bounce</option>
                                <option value="tada-custom">Tada</option>
                                <option value="flash-urgent">Urgent Flash</option>
                            </optgroup>
                            <optgroup label="Scrolling">
                                <option value="marquee">Marquee</option>
                            </optgroup>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="fontWeight" className="block text-sm font-medium text-gray-700">Font Weight</label>
                        <select
                            name="fontWeight"
                            id="fontWeight"
                            value={announcement.fontWeight}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                        >
                            <option value="lighter">Lighter</option>
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-start space-x-8 pt-2">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="enabled"
                            id="enabled"
                            checked={announcement.enabled}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                        <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900">Enable Bar</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="isSticky"
                            id="isSticky"
                            checked={announcement.isSticky}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                        <label htmlFor="isSticky" className="ml-2 block text-sm text-gray-900">Make Sticky</label>
                    </div>
                </div>

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

export default AdminAnnouncementPage;

