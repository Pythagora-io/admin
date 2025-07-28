import api from "./api";

// Description: Get customer profile
// Endpoint: GET /customer-profile
// Request: {}
// Response: { customer: CustomerProfile }
export const getCustomerProfile = async () => {
  try {
    console.log("Calling getCustomerProfile API");
    const response = await api.get("/customer-profile");
    console.log("getCustomerProfile response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};