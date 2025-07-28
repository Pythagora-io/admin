const { PYTHAGORA_API_URL } = require('../config/constants');
const axios = require('axios');

/**
 * Service for handling invoice generation via Pythagora API
 */
class InvoiceService {
  /**
   * Generate invoice URL for payment or subscription
   * @param {string} userId - User ID from Pythagora
   * @param {string} type - Type of invoice (payment|subscription) 
   * @param {string} id - ID of the payment or subscription
   * @returns {Promise<string>} Invoice URL
   */
  static async generateInvoiceUrl(userId, type, id) {
    try {
      console.log(`InvoiceService: Generating ${type} invoice for user ${userId}, id: ${id}`);

      // For now, we'll generate a mock invoice URL since we don't have the actual Pythagora API endpoint
      // In production, this would make a call to the Pythagora API
      
      // Mock implementation - replace with actual API call
      const mockInvoiceUrl = `${PYTHAGORA_API_URL}/invoices/${type}/${id}.pdf`;
      
      console.log(`InvoiceService: Generated invoice URL: ${mockInvoiceUrl}`);
      
      return mockInvoiceUrl;

      // TODO: Replace with actual Pythagora API call when endpoint is available
      // Example of what the real implementation might look like:
      /*
      const response = await axios.get(`${PYTHAGORA_API_URL}/generate-invoice`, {
        params: { type, id },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data?.success || !response.data?.url) {
        throw new Error('Invalid response from Pythagora API');
      }

      return response.data.url;
      */
    } catch (error) {
      console.error('InvoiceService: Error generating invoice URL:', error);
      throw new Error(`Failed to generate invoice: ${error.message}`);
    }
  }
}

module.exports = InvoiceService;