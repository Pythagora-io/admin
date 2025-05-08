const Payment = require('../models/Payment');
const User = require('../models/User');

/**
 * Service for managing payment records
 */
class PaymentService {
  /**
   * Get payment history for a user
   * @param {string} userId - The ID of the user
   * @returns {Promise<Array>} Array of payment records
   */
  static async getPaymentHistory(userId) {
    try {
      console.log(`PaymentService: Querying database for payments with userId: ${userId}`);
      const payments = await Payment.find({ userId })
        .sort({ date: -1 })
        .lean();
      console.log(`PaymentService: Found ${payments.length} payment records`);
      return payments;
    } catch (err) {
      console.error(`Error fetching payment history: ${err.message}`);
      throw new Error(`Error fetching payment history: ${err.message}`);
    }
  }

  /**
   * Create a payment record
   * @param {Object} paymentData - The payment data
   * @returns {Promise<Object>} The created payment record
   */
  static async createPayment(paymentData) {
    try {
      const payment = new Payment(paymentData);
      return await payment.save();
    } catch (err) {
      throw new Error(`Error creating payment record: ${err.message}`);
    }
  }

  /**
   * Get payment receipt URL
   * @param {string} paymentId - The ID of the payment
   * @returns {Promise<Object>} Object containing receipt URL
   */
  static async getPaymentReceipt(paymentId) {
    try {
      // This would typically involve generating a PDF receipt or fetching from Stripe
      // For now, we'll return a mock URL
      return {
        receiptUrl: `https://example.com/receipts/${paymentId}`
      };
    } catch (err) {
      throw new Error(`Error generating payment receipt: ${err.message}`);
    }
  }

  /**
   * Mock function to fetch payment data from Stripe
   * This would be replaced with actual Stripe API calls in production
   * 
   * @param {string} customerId - Stripe customer ID
   * @returns {Promise<Array>} Array of payment objects from Stripe
   */
  static async fetchStripePayments(customerId) {
    // This is a mock function - in reality, you would call Stripe's API
    // Something like: await stripe.charges.list({ customer: customerId })
    
    // Return mock data for demonstration
    return [
      {
        id: 'ch_mock1',
        amount: 4999, // In cents
        currency: 'usd',
        description: 'Pro subscription - Monthly',
        status: 'succeeded',
        created: Math.floor(Date.now() / 1000) - 86400 // Yesterday
      },
      {
        id: 'ch_mock2',
        amount: 4999,
        currency: 'usd',
        description: 'Pro subscription - Monthly',
        status: 'succeeded',
        created: Math.floor(Date.now() / 1000) - (86400 * 30) // 30 days ago
      }
    ];
  }

  /**
   * Sync payments from Stripe to our database
   * @param {string} userId - User ID in our database
   * @param {string} stripeCustomerId - Stripe customer ID
   */
  static async syncStripePayments(userId, stripeCustomerId) {
    try {
      if (!stripeCustomerId) {
        throw new Error('Stripe customer ID not found');
      }

      // Fetch payments from Stripe
      const stripePayments = await this.fetchStripePayments(stripeCustomerId);
      
      // For each payment, create or update in our database
      for (const payment of stripePayments) {
        const existingPayment = await Payment.findOne({ 
          userId,
          stripePaymentId: payment.id
        });

        if (!existingPayment) {
          await this.createPayment({
            userId,
            stripePaymentId: payment.id,
            amount: payment.amount / 100, // Convert cents to dollars
            currency: payment.currency,
            description: payment.description,
            status: payment.status,
            date: new Date(payment.created * 1000), // Convert Unix timestamp to Date
            metadata: payment
          });
        }
      }
      
      return await this.getPaymentHistory(userId);
    } catch (err) {
      throw new Error(`Error syncing payments from Stripe: ${err.message}`);
    }
  }
}

module.exports = PaymentService;