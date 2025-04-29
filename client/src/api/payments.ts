import api from './api';

// Description: Get user payment history
// Endpoint: GET /api/payments
// Request: {}
// Response: { payments: Array<{ id: string, date: string, amount: number, currency: string, description: string, status: string, receiptUrl: string }> }
export const getPaymentHistory = () => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                payments: [
                    {
                        id: 'pay_123456',
                        date: '2023-05-15',
                        amount: 49.99,
                        currency: 'USD',
                        description: 'Pro subscription - Monthly',
                        status: 'succeeded',
                        receiptUrl: '#'
                    },
                    {
                        id: 'pay_123455',
                        date: '2023-04-15',
                        amount: 49.99,
                        currency: 'USD',
                        description: 'Pro subscription - Monthly',
                        status: 'succeeded',
                        receiptUrl: '#'
                    },
                    {
                        id: 'pay_123454',
                        date: '2023-03-15',
                        amount: 49.99,
                        currency: 'USD',
                        description: 'Pro subscription - Monthly',
                        status: 'succeeded',
                        receiptUrl: '#'
                    },
                    {
                        id: 'pay_123453',
                        date: '2023-02-15',
                        amount: 19.99,
                        currency: 'USD',
                        description: 'Basic subscription - Monthly',
                        status: 'succeeded',
                        receiptUrl: '#'
                    },
                    {
                        id: 'pay_123452',
                        date: '2023-02-10',
                        amount: 100.00,
                        currency: 'USD',
                        description: 'Token top-up - 20M tokens',
                        status: 'succeeded',
                        receiptUrl: '#'
                    }
                ]
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.get('/api/payments');
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Get payment receipt
// Endpoint: GET /api/payments/:id/receipt
// Request: {}
// Response: { receiptUrl: string }
export const getPaymentReceipt = (paymentId: string) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                receiptUrl: `https://example.com/receipts/${paymentId}`
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.get(`/api/payments/${paymentId}/receipt`);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Get billing information
// Endpoint: GET /api/billing
// Request: {}
// Response: { billingInfo: { name: string, address: string, city: string, state: string, zip: string, country: string } }
export const getBillingInfo = () => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                billingInfo: {
                    name: 'John Doe',
                    address: '123 Main St',
                    city: 'San Francisco',
                    state: 'CA',
                    zip: '94105',
                    country: 'USA'
                }
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.get('/api/billing');
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Get Pythagora billing information (company details)
// Endpoint: GET /api/billing/company
// Request: {}
// Response: { companyInfo: { name: string, address: string, city: string, state: string, zip: string, country: string, taxId: string } }
export const getCompanyBillingInfo = () => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                companyInfo: {
                    name: 'Pythagora AI Inc.',
                    address: '548 Market St.',
                    city: 'San Francisco',
                    state: 'CA',
                    zip: '94104',
                    country: 'US',
                    taxId: 'US123456789'
                }
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.get('/api/billing/company');
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};