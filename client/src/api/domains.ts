import api from "./api";

// Description: Get user domains
// Endpoint: GET /api/domains
// Request: {}
// Response: { domains: Array<{ _id: string, domain: string, verified: boolean, createdAt: string }> }
export const getUserDomains = async () => {
  try {
    const response = await api.get("/api/domains");
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }

  // Mocking code removed
};

// Description: Add a new domain
// Endpoint: POST /api/domains
// Request: { domain: string }
// Response: { success: boolean, message: string, domain: { _id: string, domain: string, verified: boolean, createdAt: string } }
export const addDomain = async (data: { domain: string }) => {
  try {
    const response = await api.post("/api/domains", data);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }

  // Mocking code removed
};

// Description: Delete a domain
// Endpoint: DELETE /api/domains/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteDomain = async (domainId: string) => {
  try {
    const response = await api.delete(`/api/domains/${domainId}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }

  // Mocking code removed
};

// Description: Verify a domain
// Endpoint: PUT /api/domains/:id/verify
// Request: {}
// Response: { success: boolean, message: string, domain: { _id: string, domain: string, verified: boolean, createdAt: string } }
export const verifyDomain = async (domainId: string) => {
  try {
    const response = await api.put(`/api/domains/${domainId}/verify`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};
