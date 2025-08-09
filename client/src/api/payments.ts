import api from "./api";

// Description: Get user payment history
// Endpoint: GET /payments
// Request: {}
// Response: { payments: Array<{ id: string, date: string, amount: number, currency: string, description: string, status: string, receiptUrl: string }> }
export const getPaymentHistory = async () => {
  try {
    const response = await api.get("/payments");
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get payment receipt
// Endpoint: GET /payments/:id/receipt
// Request: {}
// Response: { receiptUrl: string }
export const getPaymentReceipt = async (paymentId: string) => {
  try {
    const response = await api.get(`/payments/${paymentId}/receipt`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get billing information
// Endpoint: GET /billing
// Request: {}
// Response: { billingInfo: { name: string, address: string, city: string, state: string, zip: string, country: string } }
export const getBillingInfo = async () => {
  try {
    const response = await api.get("/billing");
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get Pythagora billing information (company details)
// Endpoint: GET /billing/company
// Request: {}
// Response: { companyInfo: { name: string, address: string, city: string, state: string, zip: string, country: string, taxId: string } }
export const getCompanyBillingInfo = async () => {
  try {
    const response = await api.get("/billing/company");
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Generate invoice URL for payment or subscription
// Endpoint: GET /generate-invoice?type=payment|subscription&id=ID
// Request: { type: string, id: string }
// Response: { success: boolean, url: string }
export const generateInvoice = async (type: 'payment' | 'subscription', id: string) => {
  try {
    const response = await api.get('/generate-invoice', {
      params: { type, id }
    });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};