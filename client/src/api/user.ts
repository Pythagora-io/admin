import api from './api';

// Description: Get the current user data
// Endpoint: GET /api/user
// Request: {}
// Response: { user: { email: string, name: string, receiveUpdates: boolean } }
export const getCurrentUser = () => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                user: {
                    _id: '123456789',
                    email: 'user@example.com',
                    name: 'John Doe',
                    receiveUpdates: false
                }
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.get('/api/user');
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Update user email
// Endpoint: PUT /api/user/email
// Request: { email: string }
// Response: { success: boolean, message: string, user: { email: string } }
export const updateUserEmail = (data: { email: string }) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Email update confirmation has been sent to your current email',
                user: { email: data.email }
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.put('/api/user/email', data);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Confirm email update
// Endpoint: POST /api/user/email/confirm
// Request: { token: string }
// Response: { success: boolean, message: string, user: { email: string } }
export const confirmEmailUpdate = (data: { token: string }) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Email updated successfully',
                user: { email: 'newemail@example.com' }
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.post('/api/user/email/confirm', data);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Update user name
// Endpoint: PUT /api/user/name
// Request: { name: string }
// Response: { success: boolean, message: string, user: { name: string } }
export const updateUserName = (data: { name: string }) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Name updated successfully',
                user: { name: data.name }
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.put('/api/user/name', data);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Update user password
// Endpoint: PUT /api/user/password
// Request: { currentPassword: string, newPassword: string }
// Response: { success: boolean, message: string }
export const updateUserPassword = (data: { currentPassword: string, newPassword: string }) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Password updated successfully'
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.put('/api/user/password', data);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Update email preferences
// Endpoint: PUT /api/user/preferences/email
// Request: { receiveUpdates: boolean }
// Response: { success: boolean, message: string }
export const updateEmailPreferences = (data: { receiveUpdates: boolean }) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Email preferences updated successfully'
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.put('/api/user/preferences/email', data);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Update billing information
// Endpoint: PUT /api/user/billing
// Request: { billingInfo: { name: string, address: string, city: string, state: string, zip: string, country: string } }
// Response: { success: boolean, message: string, billingInfo: object }
export const updateBillingInfo = (data: {
    billingInfo: {
        name: string,
        address: string,
        city: string,
        state: string,
        zip: string,
        country: string
    }
}) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Billing information updated successfully',
                billingInfo: data.billingInfo
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.put('/api/user/billing', data);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};