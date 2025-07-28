const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/**
 * Mock Stripe service for development
 * In production, this would integrate with actual Stripe API
 */

/**
 * Create or get a Stripe customer by user ID
 * @param {string} userId - The Pythagora user ID
 * @returns {Promise<string>} Stripe customer ID
 */
const createOrGetCustomerByUserId = async (userId) => {
  try {
    // In a real implementation, this would:
    // 1. Check if customer exists in Stripe with metadata.pythagoraUserId = userId
    // 2. If not, create a new customer with the userId as metadata
    // 3. Return the customer ID
    
    console.log(`Creating/getting Stripe customer for Pythagora userId: ${userId}`);
    
    // Mock customer ID
    return `cus_mock_${userId}`;
  } catch (error) {
    console.error('Error creating/getting Stripe customer:', error);
    throw new Error('Failed to create or get Stripe customer');
  }
};

/**
 * Create or get a Stripe customer (deprecated - kept for backward compatibility)
 * @param {Object} user - User object
 * @returns {Promise<string>} Stripe customer ID
 */
const createOrGetCustomer = async (user) => {
  console.warn('DEPRECATED: createOrGetCustomer should use createOrGetCustomerByUserId instead');
  return createOrGetCustomerByUserId(user._id || user.userId);
};

/**
 * Create a payment intent
 * @param {Object} options - Payment intent options
 * @returns {Promise<Object>} Payment intent
 */
const createPaymentIntent = async ({ amount, currency = 'usd', customerId }) => {
  try {
    // Mock payment intent
    return {
      id: `pi_mock_${Math.random().toString(36).substring(2, 15)}`,
      client_secret: `pi_mock_${Math.random().toString(36).substring(2, 15)}_secret`,
      amount,
      currency,
      customer: customerId,
      status: 'requires_payment_method'
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Failed to create payment intent');
  }
};

/**
 * Cancel a subscription
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} Cancelled subscription
 */
const cancelSubscription = async (subscriptionId) => {
  try {
    console.log(`Cancelling Stripe subscription: ${subscriptionId}`);
    
    // Mock cancellation
    return {
      id: subscriptionId,
      status: 'canceled',
      canceled_at: Math.floor(Date.now() / 1000)
    };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
};

/**
 * Get Stripe configuration
 * @returns {Promise<Object>} Stripe configuration
 */
const getStripeConfig = async () => {
  return {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_mock_key'
  };
};

module.exports = {
  createOrGetCustomer,
  createOrGetCustomerByUserId,
  createPaymentIntent,
  cancelSubscription,
  getStripeConfig
};