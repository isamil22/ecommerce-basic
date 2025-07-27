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

    // Base styles
    let barStyle = {
        backgroundColor: announcement.backgroundColor || '#ef4444',
        color: announcement.textColor || '#ffffff',
    };

    // Determine animation class
    const animationClass = announcement.animationType && announcement.animationType !== 'none'
        ? `animate-${announcement.animationType}`
        : '';

    // Special style override for Gradient animation
    if (announcement.animationType === 'gradient-pan') {
        barStyle = {
            ...barStyle,
            // A professional-looking gradient that overrides the single color picker
            backgroundImage: 'linear-gradient(90deg, #667eea, #764ba2, #667eea)',
        };
    }

    // Special structure for Marquee animation
    if (announcement.animationType === 'marquee') {
        return (
            <div style={barStyle} className="text-center p-2 text-white font-semibold marquee-container">
                <span className="marquee-text">{announcement.text}</span>
            </div>
        );
    }

    // Default bar for all other animations
    return (
        <div style={barStyle} className={`text-center p-2 text-white font-semibold ${animationClass}`}>
            {announcement.text}
        </div>
    );
};

export default AnnouncementBar;
