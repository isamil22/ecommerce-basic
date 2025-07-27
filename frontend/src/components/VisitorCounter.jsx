import React, { useState, useEffect } from 'react';
import { getSettings } from '../api/visitorCountSettingService';

const VisitorCounter = () => {
    const [visitors, setVisitors] = useState(0);
    const [isEnabled, setIsEnabled] = useState(false);
    const [isFading, setIsFading] = useState(false); // State to control the fade effect

    useEffect(() => {
        const fetchAndSetSettings = async () => {
            try {
                const settings = await getSettings();
                if (settings.enabled) {
                    setIsEnabled(true);
                    const min = parseInt(settings.min, 10);
                    const max = parseInt(settings.max, 10);

                    // Set initial visitor count
                    setVisitors(Math.floor(Math.random() * (max - min + 1)) + min);

                    // Interval to simulate visitor changes
                    const intervalId = setInterval(() => {
                        setIsFading(true); // Trigger fade-out

                        setTimeout(() => {
                            setVisitors(prev => {
                                // Fluctuate the number by -1, 0, or +1
                                const change = Math.floor(Math.random() * 3) - 1;
                                let newCount = prev + change;
                                // Ensure the count stays within the min/max bounds
                                if (newCount < min) newCount = min + 1;
                                if (newCount > max) newCount = max - 1;
                                return newCount;
                            });
                            setIsFading(false); // Trigger fade-in
                        }, 300); // Wait for fade-out to complete before changing number

                    }, Math.random() * (5000 - 2000) + 2000); // Change every 2-5 seconds

                    return () => clearInterval(intervalId);
                }
            } catch (error) {
                console.error('Could not fetch visitor counter settings:', error);
            }
        };

        fetchAndSetSettings();
    }, []);

    if (!isEnabled || visitors === 0) {
        return null;
    }

    return (
        <div className="my-4 p-3 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg shadow-lg border border-gray-200 animate-nudge">
            <p className="flex items-center justify-center text-sm text-gray-800">
                <span className="inline-block animate-eye-pulse mr-2 text-lg">👀</span>
                Currently,
                <span
                    key={visitors} // Key change triggers re-render and animation
                    className={`font-bold text-pink-600 mx-1 text-lg ${isFading ? 'opacity-0' : 'animate-number-fade'}`}
                >
                    {visitors}
                </span>
                people are looking at this!
            </p>
        </div>
    );
};

export default VisitorCounter;