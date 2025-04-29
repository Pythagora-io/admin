import api from './api';

// Description: Get user settings
// Endpoint: GET /api/settings
// Request: {}
// Response: { settings: { [key: string]: boolean } }
export const getUserSettings = () => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                settings: {
                    enableEmailNotifications: true,
                    enableUsageAlerts: true,
                    shareAnonymousData: false,
                    darkModePreference: true,
                    enableApiLogging: true,
                    enableDebugMode: false,
                    autoSaveProjects: true
                }
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.get('/api/settings');
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Update user settings
// Endpoint: PUT /api/settings
// Request: { settings: { [key: string]: boolean } }
// Response: { success: boolean, message: string, settings: { [key: string]: boolean } }
export const updateUserSettings = (data: { settings: { [key: string]: boolean } }) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Settings updated successfully',
                settings: data.settings
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.put('/api/settings', data);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Get setting descriptions
// Endpoint: GET /api/settings/descriptions
// Request: {}
// Response: { descriptions: { [key: string]: { title: string, description: string } } }
export const getSettingDescriptions = () => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                descriptions: {
                    enableEmailNotifications: {
                        title: 'Email Notifications',
                        description: 'Receive email notifications about account activity and updates'
                    },
                    enableUsageAlerts: {
                        title: 'Usage Alerts',
                        description: 'Get notified when you approach your usage limits'
                    },
                    shareAnonymousData: {
                        title: 'Share Anonymous Data',
                        description: 'Help us improve by sharing anonymous usage data'
                    },
                    darkModePreference: {
                        title: 'Dark Mode',
                        description: 'Enable dark mode for the dashboard interface'
                    },
                    enableApiLogging: {
                        title: 'API Logging',
                        description: 'Log all API calls for debugging purposes'
                    },
                    enableDebugMode: {
                        title: 'Debug Mode',
                        description: 'Enable additional debugging information'
                    },
                    autoSaveProjects: {
                        title: 'Auto-Save Projects',
                        description: 'Automatically save projects while editing'
                    }
                }
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.get('/api/settings/descriptions');
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};