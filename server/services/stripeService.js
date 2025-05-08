const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/**
 * Initialize Stripe with the secret key
 * Note: This is a mock implementation. In production, use actual Stripe API.
 *
 * @returns {Object} Stripe configuration
 */
const getStripeConfig = async () => {
  // In a real implementation, this would verify the Stripe connection
  // and return necessary configuration
  return {
    publicKey: process.env.STRIPE_PUBLIC_KEY || "pk_test_mockStripePublicKey",
  };
};

/**
 * Create a payment intent for subscription purchase
 *
 * @param {Object} options - Options for creating payment intent
 * @param {string} options.customerId - Stripe customer ID
 * @param {number} options.amount - Amount in cents
 * @param {string} options.currency - Currency code (default: 'usd')
 * @returns {Object} Payment intent object with client secret
 */
const createPaymentIntent = async ({
  customerId,
  amount,
  currency = "usd",
}) => {
  try {
    // Mock implementation - in production, use actual Stripe API
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount,
    //   currency,
    //   customer: customerId,
    //   setup_future_usage: 'off_session',
    // });

    // Return mock payment intent
    return {
      clientSecret: `pi_mock_${Math.random().toString(36).substring(2, 15)}`,
      id: `pi_mock_${Math.random().toString(36).substring(2, 15)}`,
    };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw new Error("Failed to create payment intent");
  }
};

/**
 * Create or get a Stripe customer for a user
 *
 * @param {Object} user - User object
 * @returns {string} Stripe customer ID
 */
const createOrGetCustomer = async (user) => {
  try {
    // Check if user already has a Stripe customer ID
    if (user.stripeCustomerId) {
      console.log(
        `Using existing Stripe customer ID: ${user.stripeCustomerId}`,
      );
      return user.stripeCustomerId;
    }

    console.log(`Creating new Stripe customer for user: ${user._id}`);

    // Create a new customer using the actual Stripe API
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user._id.toString(),
      },
    });

    console.log(`Stripe customer created with ID: ${customer.id}`);

    // Update the user record with the new Stripe customer ID
    user.stripeCustomerId = customer.id;
    await user.save();

    console.log(`Updated user record with Stripe customer ID`);

    return customer.id;
  } catch (error) {
    console.error("Error creating/getting customer:", error);
    throw new Error(`Failed to create or get customer: ${error.message}`);
  }
};

/**
 * Create a subscription for a customer
 *
 * @param {Object} options - Subscription options
 * @param {string} options.customerId - Stripe customer ID
 * @param {string} options.priceId - Stripe price ID
 * @returns {Object} Subscription object
 */
const createSubscription = async ({ customerId, priceId }) => {
  try {
    // Mock implementation - in production, use actual Stripe API
    // const subscription = await stripe.subscriptions.create({
    //   customer: customerId,
    //   items: [{ price: priceId }],
    //   payment_behavior: 'default_incomplete',
    //   expand: ['latest_invoice.payment_intent'],
    // });

    // Return mock subscription
    return {
      id: `sub_mock_${Math.random().toString(36).substring(2, 15)}`,
      status: "active",
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
      items: {
        data: [
          {
            id: `si_mock_${Math.random().toString(36).substring(2, 15)}`,
            price: { id: priceId },
          },
        ],
      },
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw new Error("Failed to create subscription");
  }
};

/**
 * Get payment methods for a customer
 *
 * @param {string} customerId - Stripe customer ID
 * @returns {Array} Array of payment methods
 */
const getPaymentMethods = async (customerId) => {
  try {
    // Mock implementation - in production, use actual Stripe API
    // const paymentMethods = await stripe.paymentMethods.list({
    //   customer: customerId,
    //   type: 'card',
    // });

    // Return mock payment methods
    return {
      data: [
        {
          id: `pm_mock_${Math.random().toString(36).substring(2, 15)}`,
          type: "card",
          card: {
            brand: "visa",
            last4: "4242",
            exp_month: 12,
            exp_year: 2025,
          },
          billing_details: {},
          metadata: { isDefault: true },
        },
      ],
    };
  } catch (error) {
    console.error("Error getting payment methods:", error);
    throw new Error("Failed to get payment methods");
  }
};

/**
 * Set default payment method for a customer
 *
 * @param {string} customerId - Stripe customer ID
 * @param {string} paymentMethodId - Payment method ID
 * @returns {Object} Updated customer object
 */
const setDefaultPaymentMethod = async (customerId, paymentMethodId) => {
  try {
    // Mock implementation - in production, use actual Stripe API
    // const customer = await stripe.customers.update(customerId, {
    //   invoice_settings: {
    //     default_payment_method: paymentMethodId,
    //   },
    // });

    // Return mock response
    return {
      id: customerId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    };
  } catch (error) {
    console.error("Error setting default payment method:", error);
    throw new Error("Failed to set default payment method");
  }
};

/**
 * Delete a payment method
 *
 * @param {string} paymentMethodId - Payment method ID
 * @returns {Object} Deleted payment method
 */
const deletePaymentMethod = async (paymentMethodId) => {
  try {
    // Mock implementation - in production, use actual Stripe API
    // const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);

    // Return mock response
    return {
      id: paymentMethodId,
      deleted: true,
    };
  } catch (error) {
    console.error("Error deleting payment method:", error);
    throw new Error("Failed to delete payment method");
  }
};

/**
 * Cancel a Stripe subscription
 *
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Object} Canceled subscription object
 */
const cancelSubscription = async (subscriptionId) => {
  try {
    // Mock implementation - in production, use actual Stripe API
    // const subscription = await stripe.subscriptions.update(subscriptionId, {
    //   cancel_at_period_end: true,
    // });

    // Return mock response
    return {
      id: subscriptionId,
      status: "canceled",
      cancel_at_period_end: true,
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
    };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw new Error("Failed to cancel subscription");
  }
};

module.exports = {
  getStripeConfig,
  createPaymentIntent,
  createOrGetCustomer,
  createSubscription,
  getPaymentMethods,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  cancelSubscription,
};
