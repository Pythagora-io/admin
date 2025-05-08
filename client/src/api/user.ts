import api from './api';

// Description: Get the current user data
// Endpoint: GET /api/user/me
// Request: {}
// Response: { user: { _id: string, email: string, name: string, receiveUpdates: boolean } }
export const getCurrentUser = async () => {
    try {
        const response = await api.get('/api/user/me');
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.error || error.message);
    }
};

// Description: Update user email
// Endpoint: PUT /api/user/email
// Request: { email: string }
// Response: { success: boolean, message: string, user: { email: string } }
export const updateUserEmail = async (data: { email: string }) => {
    try {
        const response = await api.put('/api/user/email', data);
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.error || error.message);
    }
};

// Description: Confirm email update
// Endpoint: POST /api/user/email/confirm
// Request: { token: string }
// Response: { success: boolean, message: string, user: { email: string } }
export const confirmEmailUpdate = (data: { token: string }) => {
    // Mocking the response - This would be implemented in a future task
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
    //   throw new Error(error?.response?.data?.error || error.message);
    // }
};

// Description: Update user name
// Endpoint: PUT /api/user/name
// Request: { name: string }
// Response: { success: boolean, message: string, user: { name: string } }
export const updateUserName = async (data: { name: string }) => {
    try {
        const response = await api.put('/api/user/name', data);
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.error || error.message);
    }
};

// Description: Update user password
// Endpoint: PUT /api/user/password
// Request: { currentPassword: string, newPassword: string }
// Response: { success: boolean, message: string }
export const updateUserPassword = async (data: { currentPassword: string, newPassword: string }) => {
    try {
        const response = await api.put('/api/user/password', data);
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.error || error.message);
    }
};

// Description: Update email preferences
// Endpoint: PUT /api/user/preferences/email
// Request: { receiveUpdates: boolean }
// Response: { success: boolean, message: string }
export const updateEmailPreferences = async (data: { receiveUpdates: boolean }) => {
    try {
        const response = await api.put('/api/user/preferences/email', data);
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.error || error.message);
    }
};

// Description: Update user billing information
// Endpoint: PUT /api/billing
// Request: { billingInfo: { name: string, address: string, city: string, state: string, zip: string, country: string } }
// Response: { success: boolean, message: string, billingInfo: { name: string, address: string, city: string, state: string, zip: string, country: string } }
export const updateBillingInfo = async (data: { billingInfo: { name: string, address: string, city: string, state: string, zip: string, country: string } }) => {
  try {
    const response = await api.put('/api/billing', data);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};