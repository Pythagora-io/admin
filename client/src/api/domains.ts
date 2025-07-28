import api from "./api";

// Description: Get user domains
// Endpoint: GET /domains
// Request: {}
// Response: { domains: Array<{ _id: string, domain: string, verified: boolean, createdAt: string }> }
export const getUserDomains = async () => {
  try {
    const response = await api.get("/domains");
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Add a new domain
// Endpoint: POST /domains
// Request: { domain: string }
// Response: { success: boolean, message: string, domain: { _id: string, domain: string, verified: boolean, createdAt: string } }
export const addDomain = async (data: { domain: string }) => {
  try {
    const response = await api.post("/domains", data);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete a domain
// Endpoint: DELETE /domains/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteDomain = async (domainId: string) => {
  try {
    const response = await api.delete(`/domains/${domainId}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Verify a domain
// Endpoint: PUT /domains/:id/verify
// Request: {}
// Response: { success: boolean, message: string, domain: { _id: string, domain: string, verified: boolean, createdAt: string } }
export const verifyDomain = async (domainId: string) => {
  try {
    const response = await api.put(`/domains/${domainId}/verify`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};