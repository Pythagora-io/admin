import api from './api';

// Description: Get Stripe public key
// Endpoint: GET /api/stripe/config
// Request: {}
// Response: { publicKey: string }
export const getStripeConfig = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        publicKey: 'pk_test_mockStripePublicKey'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/stripe/config');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Create payment intent for subscription
// Endpoint: POST /api/stripe/create-payment-intent
// Request: { planId: string }
// Response: { clientSecret: string }
export const createPaymentIntent = (data: { planId: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        clientSecret: 'pi_mock_client_secret_' + Math.random().toString(36).substring(2, 15)
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/stripe/create-payment-intent', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Create payment intent for token top-up
// Endpoint: POST /api/stripe/create-topup-payment-intent
// Request: { packageId: string }
// Response: { clientSecret: string }
export const createTopUpPaymentIntent = (data: { packageId: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        clientSecret: 'pi_mock_client_secret_' + Math.random().toString(36).substring(2, 15)
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/stripe/create-topup-payment-intent', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Get user payment methods
// Endpoint: GET /api/stripe/payment-methods
// Request: {}
// Response: { paymentMethods: Array<{ id: string, brand: string, last4: string, expMonth: number, expYear: number, isDefault: boolean }> }
export const getPaymentMethods = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        paymentMethods: [
          {
            id: 'pm_mock_1',
            brand: 'visa',
            last4: '4242',
            expMonth: 12,
            expYear: 2025,
            isDefault: true
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/stripe/payment-methods');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Set default payment method
// Endpoint: POST /api/stripe/set-default-payment-method
// Request: { paymentMethodId: string }
// Response: { success: boolean, message: string }
export const setDefaultPaymentMethod = (data: { paymentMethodId: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Default payment method updated successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/stripe/set-default-payment-method', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};

// Description: Delete payment method
// Endpoint: DELETE /api/stripe/payment-methods/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deletePaymentMethod = (paymentMethodId: string) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Payment method deleted successfully'
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.delete(`/api/stripe/payment-methods/${paymentMethodId}`);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
};