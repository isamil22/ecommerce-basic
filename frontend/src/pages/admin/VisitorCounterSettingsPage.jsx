import React, { useState, useEffect } from 'react';

const VisitorCounterSettingsPage = () => {
    const [settings, setSettings] = useState({
        enabled: false,
        min: 10,
        max: 50,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/settings/visitor-counter');
                if (!response.ok) {
                    throw new Error('Failed to fetch settings.');
                }
                const data = await response.json();
                setSettings({
                    enabled: data.enabled || false,
                    min: data.min || 10,
                    max: data.max || 50,
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await fetch('/api/settings/visitor-counter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (!response.ok) {
                throw new Error('Failed to save settings. Please try again.');
            }
            alert('✅ Settings saved successfully!');
        } catch (err) {
            setError(err.message);
            alert(`❌ Error: ${err.message}`);
        }
    };

    if (isLoading) {
        return <div>Loading Settings...</div>;
    }

    return (
        <div className="admin-settings-page">
            <h2>👁️ Visitor Counter Settings</h2>
            <p>Control the fake visitor counter displayed on product and pack pages.</p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSaveSettings}>
                <div className="setting-toggle">
                    <label htmlFor="enable-counter">Enable Visitor Counter</label>
                    <input
                        id="enable-counter"
                        type="checkbox"
                        checked={settings.enabled}
                        onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                    />
                </div>

                {settings.enabled && (
                    <div className="visitor-range-settings">
                        <div className="setting-field">
                            <label htmlFor="min-visitors">Minimum Visitors</label>
                            <input
                                id="min-visitors"
                                type="number"
                                value={settings.min}
                                onChange={(e) => setSettings({ ...settings, min: parseInt(e.target.value, 10) || 1 })}
                                min="1"
                            />
                        </div>
                        <div className="setting-field">
                            <label htmlFor="max-visitors">Maximum Visitors</label>
                            <input
                                id="max-visitors"
                                type="number"
                                value={settings.max}
                                onChange={(e) => setSettings({ ...settings, max: parseInt(e.target.value, 10) || 1 })}
                                min={settings.min}
                            />
                        </div>
                    </div>
                )}

                <button type="submit" className="save-button">Save Settings</button>
            </form>
        </div>
    );
};

export default VisitorCounterSettingsPage;