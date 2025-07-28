const axios = require('axios');
const { PYTHAGORA_API_URL } = require('../config/constants');

class OrganizationService {
  /**
   * Accept organization invitation
   * Input: { token: string, accessToken: string }
   * Output: { success: boolean, message: string, membership?: object }
   */
  static async acceptInvitation(token, accessToken) {
    try {
      console.log('OrganizationService: Accepting invitation with Pythagora API');

      const response = await axios.post(
        `${PYTHAGORA_API_URL}/organizations/accept-invite`,
        { token },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('OrganizationService: Invitation acceptance successful');

      return {
        success: true,
        message: response.data.message || 'Invitation accepted successfully',
        membership: response.data.membership
      };
    } catch (error) {
      console.error('OrganizationService: Error accepting invitation:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to accept invitation'
      };
    }
  }
}

module.exports = OrganizationService;