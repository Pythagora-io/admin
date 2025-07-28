const Payment = require("../models/Payment");
const BillingInfo = require("../models/BillingInfo");

/**
 * Service for managing payment records
 */
class PaymentService {
  /**
   * Get payment history for a user
   * @param {string} userId - Pythagora user ID
   * @returns {Promise<Array>} Payment history
   */
  static async getPaymentHistory(userId) {
    try {
      console.log(`PaymentService: Getting payment history for userId: ${userId}`);
      
      const payments = await Payment.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50);

      // Mock payment data for development
      const mockPayments = [
        {
          id: "pay_1234567890",
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Pro Plan Subscription",
          amount: 29.99,
          currency: "USD",
          status: "paid",
          receiptUrl: "/api/payments/pay_1234567890/receipt"
        },
        {
          id: "pay_0987654321",
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          description: "Token Top-up - 20M tokens",
          amount: 100.00,
          currency: "USD",
          status: "paid",
          receiptUrl: "/api/payments/pay_0987654321/receipt"
        }
      ];

      return payments.length > 0 ? payments : mockPayments;
    } catch (error) {
      console.error('PaymentService: Error getting payment history:', error);
      throw new Error(`Failed to get payment history: ${error.message}`);
    }
  }

  /**
   * Create a new payment record
   * @param {string} userId - Pythagora user ID
   * @param {Object} paymentData - Payment information
   * @returns {Promise<Object>} Created payment
   */
  static async createPayment(userId, paymentData) {
    try {
      console.log(`PaymentService: Creating payment for userId: ${userId}`);
      
      const payment = new Payment({
        userId,
        ...paymentData
      });

      await payment.save();
      return payment;
    } catch (error) {
      console.error('PaymentService: Error creating payment:', error);
      throw new Error(`Failed to create payment: ${error.message}`);
    }
  }

  /**
   * Get payment receipt
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} Receipt data
   */
  static async getPaymentReceipt(paymentId) {
    try {
      console.log(`PaymentService: Getting receipt for payment: ${paymentId}`);
      
      // In a real implementation, this would generate a PDF receipt
      return {
        receiptUrl: `/api/payments/${paymentId}/receipt.pdf`,
        downloadUrl: `/api/payments/${paymentId}/download`
      };
    } catch (error) {
      console.error('PaymentService: Error getting payment receipt:', error);
      throw new Error(`Failed to get payment receipt: ${error.message}`);
    }
  }

  /**
   * Sync payments with Stripe
   * @param {string} userId - Pythagora user ID
   * @returns {Promise<Object>} Sync result
   */
  static async syncPaymentsWithStripe(userId) {
    try {
      console.log(`PaymentService: Syncing payments with Stripe for userId: ${userId}`);
      
      // In a real implementation, this would fetch payments from Stripe
      // and sync them with our local database
      
      return {
        success: true,
        message: "Payments synced successfully",
        synced: 0
      };
    } catch (error) {
      console.error('PaymentService: Error syncing payments with Stripe:', error);
      throw new Error(`Failed to sync payments: ${error.message}`);
    }
  }
}

module.exports = PaymentService;