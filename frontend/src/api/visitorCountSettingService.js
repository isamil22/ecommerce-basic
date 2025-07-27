import apiService from './apiService';

/**
 * Fetches visitor counter settings from the backend.
 * @returns {Promise<Object>} A promise that resolves to an object containing the settings.
 */
export const getSettings = async () => {
    // Note the updated API endpoint to match the backend controller
    const response = await apiService.get('/visitor-counter-settings');
    return response.data;
};

/**
 * Saves visitor counter settings to the backend.
 * @param {Object} settings - An object containing the settings to save.
 * @returns {Promise<Object>} A promise that resolves to the server's response.
 */
export const saveSettings = async (settings) => {
    const response = await apiService.post('/visitor-counter-settings', settings);
    return response.data;
};