import React, { useState, useEffect, useRef } from 'react';
import { getAnnouncement } from '../api/apiService';

const AnnouncementBar = () => {
    const [announcement, setAnnouncement] = useState(null);
    const barRef = useRef(null);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const { data } = await getAnnouncement();
                if (data.enabled) {
                    setAnnouncement(data);
                } else {
                    setAnnouncement(null); // Clear announcement if disabled
                }
            } catch (error) {
                console.error('Failed to fetch announcement:', error);
                setAnnouncement(null); // Also clear on error
            }
        };

        fetchAnnouncement();
        // Poll for changes every 30 seconds to keep it fresh
        const interval = setInterval(fetchAnnouncement, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // This effect runs when the announcement data changes.
        // It measures the bar's height and sets a CSS variable on the root HTML element.
        // This allows other components (like App.jsx) to know the bar's height.
        if (announcement && announcement.isSticky && barRef.current) {
            const barHeight = barRef.current.offsetHeight;
            document.documentElement.style.setProperty('--announcement-bar-height', `${barHeight}px`);
        } else {
            // If the bar isn't sticky or doesn't exist, reset the height.
            document.documentElement.style.setProperty('--announcement-bar-height', '0px');
        }
    }, [announcement]);


    if (!announcement) {
        return null;
    }

    // Base styles applied directly to the element
    let barStyle = {
        backgroundColor: announcement.backgroundColor || '#ef4444',
        color: announcement.textColor || '#ffffff',
        fontWeight: announcement.fontWeight || 'normal',
    };

    // Determine animation class from Tailwind config
    const animationClass = announcement.animationType && announcement.animationType !== 'none'
        ? `animate-${announcement.animationType}`
        : '';

    // The gradient animation needs a special background image style
    if (announcement.animationType === 'gradient-pan') {
        barStyle = {
            ...barStyle,
            backgroundImage: 'linear-gradient(90deg, #667eea, #764ba2, #667eea)',
        };
    }

    // Combine all necessary CSS classes
    const containerClasses = [
        'text-center', 'p-2', 'w-full', 'z-50',
        animationClass, // Add animation class if it exists
        announcement.isSticky ? 'sticky top-0' : '' // Add sticky class if enabled
    ].filter(Boolean).join(' '); // filter(Boolean) removes any falsey values (e.g., empty strings)

    // The marquee animation requires a different HTML structure
    if (announcement.animationType === 'marquee') {
        return (
            <div ref={barRef} style={barStyle} className={`${containerClasses} marquee-container`}>
                <span className="marquee-text">{announcement.text}</span>
            </div>
        );
    }

    // Render the default bar for all other animations
    return (
        <div ref={barRef} style={barStyle} className={containerClasses}>
            {announcement.text}
        </div>
    );
};

export default AnnouncementBar;

