import api from "./api";

// Description: Get Stripe public key
// Endpoint: GET /api/stripe/config
// Request: {}
// Response: { publicKey: string }
export const getStripeConfig = async () => {
  try {
    const response = await api.get("/api/stripe/config");
    return response.data;
  } catch (error) {
    console.error("Error fetching Stripe configuration:", error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Create payment intent for subscription
// Endpoint: POST /api/stripe/create-payment-intent
// Request: { planId: string }
// Response: { clientSecret: string }
export const createPaymentIntent = async (data: { planId: string }) => {
  try {
    const response = await api.post("/api/stripe/create-payment-intent", data);
    return response.data;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Create payment intent for token top-up
// Endpoint: POST /api/stripe/create-topup-payment-intent
// Request: { packageId: string }
// Response: { clientSecret: string }
export const createTopUpPaymentIntent = async (data: { packageId: string }) => {
  try {
    const response = await api.post(
      "/api/stripe/create-topup-payment-intent",
      data,
    );
    return response.data;
  } catch (error) {
    console.error("Error creating top-up payment intent:", error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get user payment methods
// Endpoint: GET /api/stripe/payment-methods
// Request: {}
// Response: { paymentMethods: Array<{ id: string, brand: string, last4: string, expMonth: number, expYear: number, isDefault: boolean }> }
export const getPaymentMethods = async () => {
  try {
    const response = await api.get("/api/stripe/payment-methods");
    return response.data;
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Set default payment method
// Endpoint: POST /api/stripe/set-default-payment-method
// Request: { paymentMethodId: string }
// Response: { success: boolean, message: string }
export const setDefaultPaymentMethod = async (data: {
  paymentMethodId: string;
}) => {
  try {
    const response = await api.post(
      "/api/stripe/set-default-payment-method",
      data,
    );
    return response.data;
  } catch (error) {
    console.error("Error setting default payment method:", error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete payment method
// Endpoint: DELETE /api/stripe/payment-methods/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deletePaymentMethod = async (paymentMethodId: string) => {
  try {
    const response = await api.delete(
      `/api/stripe/payment-methods/${paymentMethodId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting payment method:", error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};
