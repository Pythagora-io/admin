import api from './api';

// Description: Get user subscription
// Endpoint: GET /api/subscription
// Request: {}
// Response: { subscription: { plan: string, status: string, startDate: string, nextBillingDate: string, amount: number, currency: string } }
export const getUserSubscription = () => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                subscription: {
                    plan: 'Pro',
                    status: 'active',
                    startDate: '2023-05-15',
                    nextBillingDate: '2023-06-15',
                    amount: 49.99,
                    currency: 'USD',
                    tokens: 50000000
                }
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.get('/api/subscription');
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Get subscription plans
// Endpoint: GET /api/subscription/plans
// Request: {}
// Response: { plans: Array<{ id: string, name: string, price: number, currency: string, features: string[] }> }
export const getSubscriptionPlans = () => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                plans: [
                    {
                        id: 'free',
                        name: 'Free',
                        price: 0,
                        currency: 'USD',
                        tokens: 0,
                        features: ['Use your own API keys', 'Build front-end only apps', '1 deployed app', 'Watermark on deployed apps']
                    },
                    {
                        id: 'pro',
                        name: 'Pro',
                        price: 49,
                        currency: 'USD',
                        tokens: 10000000,
                        features: ['Build full-stack applications', 'Front-end + Back-end', 'Set up and connect databases', 'Deploy without watermark', '10M tokens included']
                    },
                    {
                        id: 'premium',
                        name: 'Premium',
                        price: 89,
                        currency: 'USD',
                        tokens: 20000000,
                        features: ['Everything in Pro', '20M tokens included', 'Priority support', 'Advanced integrations']
                    },
                    {
                        id: 'enterprise',
                        name: 'Enterprise',
                        price: null,
                        currency: 'USD',
                        tokens: null,
                        isEnterprise: true,
                        features: ['Everything in Premium', 'Unlimited deployments', 'SSO', 'SLA', 'Access control', 'Audit logging']
                    }
                ]
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.get('/api/subscription/plans');
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Update subscription
// Endpoint: PUT /api/subscription
// Request: { planId: string }
// Response: { success: boolean, message: string, subscription: object }
export const updateSubscription = (data: { planId: string }) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            const plans = {
                'free': {
                    name: 'Free',
                    price: 0,
                    tokens: 0
                },
                'pro': {
                    name: 'Pro',
                    price: 49,
                    tokens: 10000000
                },
                'premium': {
                    name: 'Premium',
                    price: 89,
                    tokens: 20000000
                }
            };

            const selectedPlan = plans[data.planId] || plans.free;

            resolve({
                success: true,
                message: 'Subscription updated successfully',
                subscription: {
                    plan: selectedPlan.name,
                    status: 'active',
                    startDate: new Date().toISOString().split('T')[0],
                    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    amount: selectedPlan.price,
                    currency: 'USD',
                    tokens: selectedPlan.tokens
                }
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.put('/api/subscription', data);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Get token top-up packages
// Endpoint: GET /api/subscription/topup
// Request: {}
// Response: { packages: Array<{ id: string, price: number, tokens: number, currency: string }> }
export const getTopUpPackages = () => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                packages: [
                    {
                        id: 'topup-50',
                        price: 50,
                        tokens: 10000000,
                        currency: 'USD'
                    },
                    {
                        id: 'topup-100',
                        price: 100,
                        tokens: 20000000,
                        currency: 'USD'
                    },
                    {
                        id: 'topup-200',
                        price: 200,
                        tokens: 40000000,
                        currency: 'USD'
                    },
                    {
                        id: 'topup-500',
                        price: 500,
                        tokens: 200000000,
                        currency: 'USD'
                    },
                    {
                        id: 'topup-1000',
                        price: 1000,
                        tokens: 300000000,
                        currency: 'USD'
                    }
                ]
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.get('/api/subscription/topup');
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Purchase token top-up
// Endpoint: POST /api/subscription/topup
// Request: { packageId: string }
// Response: { success: boolean, message: string, tokens: number }
export const purchaseTopUp = (data: { packageId: string }) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            const packages = {
                'topup-50': 10000000,
                'topup-100': 20000000,
                'topup-200': 40000000,
                'topup-500': 200000000,
                'topup-1000': 300000000
            };

            const tokens = packages[data.packageId] || 0;

            resolve({
                success: true,
                message: 'Token top-up purchased successfully',
                tokens
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.post('/api/subscription/topup', data);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};