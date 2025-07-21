import apiService from './apiService';

/**
 * Fetches all application settings from the backend.
 * @returns {Promise<Object>} A promise that resolves to an object containing the settings.
 */
export const getSettings = async () => {
    const response = await apiService.get('/settings');
    return response.data;
};

/**
 * Saves application settings to the backend.
 * @param {Object} settings - An object containing the settings to save.
 * @returns {Promise<Object>} A promise that resolves to the server's response.
 */
export const saveSettings = async (settings) => {
    const response = await apiService.post('/settings', settings);
    return response.data;
};
