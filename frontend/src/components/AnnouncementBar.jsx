import React, { useState, useEffect } from 'react';
import { getAnnouncement } from '../api/apiService';

const AnnouncementBar = () => {
    const [announcement, setAnnouncement] = useState(null);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const { data } = await getAnnouncement();
                if (data.enabled) {
                    setAnnouncement(data);
                }
            } catch (error) {
                console.error('Failed to fetch announcement:', error);
            }
        };

        fetchAnnouncement();
    }, []);

    if (!announcement) {
        return null;
    }

    const barStyle = {
        backgroundColor: announcement.backgroundColor || '#ef4444',
        color: announcement.textColor || '#ffffff',
    };

    return (
        <div style={barStyle} className="text-center p-2 text-white font-semibold">
            {announcement.text}
        </div>
    );
};

export default AnnouncementBar;