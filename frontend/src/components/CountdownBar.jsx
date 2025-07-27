import React, { useState, useEffect } from 'react';
import { getCountdown } from '../api/apiService';

const CountdownBar = () => {
    const [config, setConfig] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        getCountdown()
            .then(response => {
                if (response.data && response.data.enabled) {
                    setConfig(response.data);
                }
            })
            .catch(error => console.error('Error fetching countdown:', error));
    }, []);

    useEffect(() => {
        if (!config) return;

        const calculateTimeLeft = () => {
            const difference = +new Date(config.endDate) - +new Date();
            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return null;
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        // Set initial time left
        setTimeLeft(calculateTimeLeft());

        return () => clearInterval(timer);
    }, [config]);

    if (!config || !timeLeft) {
        return null;
    }

    const timeSegments = [
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Seconds', value: timeLeft.seconds },
    ];

    return (
        <div
            className="text-white p-4 flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-6 shadow-lg"
            style={{
                background: `linear-gradient(45deg, ${config.backgroundColor || '#ef4444'}, ${config.textColor || '#f472b6'})`
            }}
        >
            <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-bold tracking-wider">{config.title}</h3>
            </div>
            <div className="flex items-center space-x-3">
                {timeSegments.map(segment => (
                    <div key={segment.label} className="flex flex-col items-center">
                        <div className="text-3xl font-extrabold p-2 bg-white bg-opacity-20 rounded-md">
                            {String(segment.value).padStart(2, '0')}
                        </div>
                        <div className="text-xs uppercase tracking-widest mt-1">{segment.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CountdownBar;
