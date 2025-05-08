import api from './api';

// Description: Get user subscription
// Endpoint: GET /api/subscription
// Request: {}
// Response: { subscription: { plan: string, status: string, startDate: string, nextBillingDate: string, amount: number, currency: string, tokens: number } }
export const getUserSubscription = async () => {
  try {
    console.log("Calling getUserSubscription API");
    const response = await api.get('/api/subscription');
    console.log("getUserSubscription response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription data:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get subscription plans
// Endpoint: GET /api/subscription/plans
// Request: {}
// Response: { plans: Array<{ id: string, name: string, price: number, currency: string, features: string[] }> }
export const getSubscriptionPlans = async () => {
    try {
        const response = await api.get('/api/subscription/plans');
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.error || error.message);
    }
};

// Description: Update subscription
// Endpoint: PUT /api/subscription
// Request: { planId: string }
// Response: { success: boolean, message: string, subscription: object }
export const updateSubscription = async (data: { planId: string }) => {
    try {
        const response = await api.put('/api/subscription', data);
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.error || error.message);
    }
};

// Description: Get token top-up packages
// Endpoint: GET /api/subscription/topup
// Request: {}
// Response: { packages: Array<{ id: string, price: number, tokens: number, currency: string }> }
export const getTopUpPackages = async () => {
    try {
        const response = await api.get('/api/subscription/topup');
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.error || error.message);
    }
};

// Description: Purchase token top-up
// Endpoint: POST /api/subscription/topup
// Request: { packageId: string }
// Response: { success: boolean, message: string, tokens: number }
export const purchaseTopUp = async (data: { packageId: string }) => {
    try {
        const response = await api.post('/api/subscription/topup', data);
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.error || error.message);
    }
};

// Description: Cancel subscription
// Endpoint: POST /api/subscription/cancel
// Request: { reason?: string }
// Response: { success: boolean, message: string, subscription: object }
export const cancelSubscription = async (data: { reason?: string }) => {
    try {
        const response = await api.post('/api/subscription/cancel', data);
        return response.data;
    } catch (error) {
        throw new Error(error?.response?.data?.error || error.message);
    }
};