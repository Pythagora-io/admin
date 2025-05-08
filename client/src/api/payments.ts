import api from "./api";

// Description: Get user payment history
// Endpoint: GET /api/payments
// Request: {}
// Response: { payments: Array<{ id: string, date: string, amount: number, currency: string, description: string, status: string, receiptUrl: string }> }
export const getPaymentHistory = async () => {
  try {
    const response = await api.get("/api/payments");
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get payment receipt
// Endpoint: GET /api/payments/:id/receipt
// Request: {}
// Response: { receiptUrl: string }
export const getPaymentReceipt = async (paymentId: string) => {
  try {
    const response = await api.get(`/api/payments/${paymentId}/receipt`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get billing information
// Endpoint: GET /api/billing
// Request: {}
// Response: { billingInfo: { name: string, address: string, city: string, state: string, zip: string, country: string } }
export const getBillingInfo = async () => {
  try {
    const response = await api.get("/api/billing");
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get Pythagora billing information (company details)
// Endpoint: GET /api/billing/company
// Request: {}
// Response: { companyInfo: { name: string, address: string, city: string, state: string, zip: string, country: string, taxId: string } }
export const getCompanyBillingInfo = async () => {
  try {
    const response = await api.get("/api/billing/company");
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};
