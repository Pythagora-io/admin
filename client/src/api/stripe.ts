import api from "./api";

// Description: Get Stripe public key
// Endpoint: GET /stripe/config
// Request: {}
// Response: { publicKey: string }
export const getStripeConfig = async () => {
  try {
    const response = await api.get("/stripe/config");
    return response.data;
  } catch (error) {
    console.error("Error fetching Stripe configuration:", error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Create payment intent for subscription
// Endpoint: POST /stripe/create-payment-intent
// Request: { planId: string }
// Response: { clientSecret: string }
export const createPaymentIntent = async (data: { planId: string }) => {
  try {
    const response = await api.post("/stripe/create-payment-intent", data);
    return response.data;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Create payment intent for token top-up
// Endpoint: POST /stripe/create-topup-payment-intent
// Request: { packageId: string }
// Response: { clientSecret: string }
export const createTopUpPaymentIntent = async (data: { packageId: string }) => {
  try {
    const response = await api.post(
      "/stripe/create-topup-payment-intent",
      data,
    );
    return response.data;
  } catch (error) {
    console.error("Error creating top-up payment intent:", error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get user payment methods
// Endpoint: GET /stripe/payment-methods
// Request: {}
// Response: { paymentMethods: Array<{ id: string, brand: string, last4: string, expMonth: number, expYear: number, isDefault: boolean }> }
export const getPaymentMethods = async () => {
  try {
    const response = await api.get("/stripe/payment-methods");
    return response.data;
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Set default payment method
// Endpoint: POST /stripe/set-default-payment-method
// Request: { paymentMethodId: string }
// Response: { success: boolean, message: string }
export const setDefaultPaymentMethod = async (data: {
  paymentMethodId: string;
}) => {
  try {
    const response = await api.post(
      "/stripe/set-default-payment-method",
      data,
    );
    return response.data;
  } catch (error) {
    console.error("Error setting default payment method:", error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete payment method
// Endpoint: DELETE /stripe/payment-methods/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deletePaymentMethod = async (paymentMethodId: string) => {
  try {
    const response = await api.delete(
      `/stripe/payment-methods/${paymentMethodId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting payment method:", error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Cancel user subscription via Pythagora API
// Endpoint: POST /stripe/cancel-subscription (Pythagora API)
// Request: {}
// Response: { success: boolean, message: string }
export const cancelSubscription = async () => {
  try {
    console.log("cancelSubscription: Making call to Pythagora API via api client");
    const response = await api.post("/stripe/cancel-subscription");
    console.log("cancelSubscription: Pythagora API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};