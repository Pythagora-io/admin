import api from './api';

// Helper function to safely decode Base64 URL (used in JWT)
const safeBase64UrlDecode = (str: string): string => {
  try {
    // Convert Base64 URL to standard Base64
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    
    // Decode using atob
    const decoded = atob(base64);
    
    // Handle UTF-8 characters properly
    return decodeURIComponent(escape(decoded));
  } catch (error) {
    console.error("Error in safeBase64UrlDecode:", error);
    throw error;
  }
};

// Description: Get current user from localStorage (decode JWT token)
// This function decodes the JWT token stored in localStorage
export const getCurrentUser = () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('getCurrentUser: No access token found');
      return null;
    }

    // Decode JWT token (split by dots and decode the payload)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('getCurrentUser: Invalid token format');
      return null;
    }

    const payloadStr = safeBase64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadStr);
    console.log('getCurrentUser: Decoded token payload:', payload);

    return {
      _id: payload.userId,
      userId: payload.userId,
      email: payload.email,
      name: payload.fullName,
      fullName: payload.fullName,
      receiveUpdates: payload.receiveUpdates || true,
      subscription: {
        plan: payload.subscriptionPlan || 'free',
        status: payload.subscriptionStatus || 'active',
        tokensUsed: payload.tokensUsed || 0,
        tokensLimit: payload.tokensLimit || 1000000
      }
    };
  } catch (error) {
    console.error('getCurrentUser: Error decoding token:', error);
    return null;
  }
};

// Description: Get user profile from Pythagora API
// Endpoint: GET /profile
// Request: {}
// Response: { user: object, deployments: Array<object> }
export const getUserProfile = async () => {
  try {
    console.log('getUserProfile: Fetching user profile from Pythagora API');
    const response = await api.get('/profile');
    console.log('getUserProfile: Profile response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('getUserProfile: Error fetching user profile:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update user billing information
// Endpoint: PUT /api/user/billing
// Request: { billingInfo: object }
// Response: { success: boolean, message: string }
export const updateBillingInfo = async (billingInfo: any) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Billing information updated successfully' });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put('/api/user/billing', { billingInfo });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
};