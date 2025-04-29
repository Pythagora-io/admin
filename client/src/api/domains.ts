import api from './api';

// Description: Get user domains
// Endpoint: GET /api/domains
// Request: {}
// Response: { domains: Array<{ id: string, domain: string, verified: boolean, createdAt: string }> }
export const getUserDomains = () => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                domains: [
                    {
                        _id: 'dom_123456',
                        domain: 'example.com',
                        verified: true,
                        createdAt: '2023-04-10T14:23:56.789Z'
                    },
                    {
                        _id: 'dom_123457',
                        domain: 'mybusiness.org',
                        verified: true,
                        createdAt: '2023-05-05T09:12:34.567Z'
                    },
                    {
                        _id: 'dom_123458',
                        domain: 'newproject.net',
                        verified: false,
                        createdAt: '2023-06-01T16:45:12.345Z'
                    }
                ]
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.get('/api/domains');
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Add a new domain
// Endpoint: POST /api/domains
// Request: { domain: string }
// Response: { success: boolean, message: string, domain: { id: string, domain: string, verified: boolean, createdAt: string } }
export const addDomain = (data: { domain: string }) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Domain added successfully',
                domain: {
                    _id: `dom_${Date.now()}`,
                    domain: data.domain,
                    verified: false,
                    createdAt: new Date().toISOString()
                }
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.post('/api/domains', data);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};

// Description: Delete a domain
// Endpoint: DELETE /api/domains/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteDomain = (domainId: string) => {
    // Mocking the response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Domain deleted successfully'
            });
        }, 500);
    });
    // Uncomment the below lines to make an actual API call
    // try {
    //   return await api.delete(`/api/domains/${domainId}`);
    // } catch (error) {
    //   throw new Error(error?.response?.data?.message || error.message);
    // }
};