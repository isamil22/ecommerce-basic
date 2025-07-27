import React, { useState, useEffect } from 'react';

const VisitorCounter = () => {
    const [visitors, setVisitors] = useState(0);
    const [settings, setSettings] = useState({ enabled: false, min: 1, max: 10 });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/settings/visitor-counter');
                if (response.ok) {
                    const data = await response.json();
                    setSettings(data);
                }
            } catch (error) {
                console.error('Error fetching visitor counter settings:', error);
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        if (settings.enabled) {
            const updateVisitors = () => {
                const randomVisitors =
                    Math.floor(Math.random() * (settings.max - settings.min + 1)) + settings.min;
                setVisitors(randomVisitors);
            };

            updateVisitors();
            const interval = setInterval(updateVisitors, 30000);

            return () => clearInterval(interval);
        }
    }, [settings]);

    if (!settings.enabled || visitors === 0) {
        return null;
    }

    return (
        <div className="visitor-counter">
            <p>👀 There are currently {visitors} people viewing this!</p>
        </div>
    );
};

export default VisitorCounter;