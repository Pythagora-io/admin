/**
 * Service for managing subscription-related operations
 */
const subscriptionPlans = require("../config/subscriptionPlans");
const Subscription = require("../models/Subscription");
const stripeService = require("./stripeService");

/**
 * Get all available subscription plans
 * @returns {Array} Array of subscription plans
 */
const getAllPlans = () => {
  return subscriptionPlans;
};

/**
 * Get a specific subscription plan by ID
 * @param {string} planId - The ID of the plan to retrieve
 * @returns {Object|null} The subscription plan or null if not found
 */
const getPlanById = (planId) => {
  return subscriptionPlans.find((plan) => plan.id === planId) || null;
};

/**
 * Get a user's current subscription
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object|null>} The subscription object or null if not found
 */
const getUserSubscription = async (userId) => {
  try {
    const subscription = await Subscription.findOne({ userId })
      .sort({ createdAt: -1 })
      .exec();

    if (!subscription) {
      // Return a default free subscription if none exists
      return {
        plan: "Free",
        status: "active",
        startDate: new Date(),
        nextBillingDate: new Date(),
        amount: 0,
        currency: "USD",
        tokens: 0,
      };
    }

    // Get the plan details
    const plan = getPlanById(subscription.planId);

    return {
      plan: plan.name,
      status: subscription.status,
      startDate: subscription.startDate,
      nextBillingDate: subscription.nextBillingDate,
      amount: plan.price || 0,
      currency: plan.currency || "USD",
      tokens: subscription.tokens || plan.tokens || 0,
    };
  } catch (error) {
    console.error("Error getting user subscription:", error);
    throw new Error("Failed to retrieve user subscription");
  }
};

/**
 * Update a user's subscription
 * @param {string} userId - The ID of the user
 * @param {string} planId - The ID of the plan to subscribe to
 * @returns {Promise<Object>} The updated subscription object
 */
const updateSubscription = async (userId, planId) => {
  try {
    const plan = getPlanById(planId);
    if (!plan) {
      throw new Error("Invalid subscription plan");
    }

    // Since we're not managing users internally, we'll work with the userId from Pythagora
    // Get or create Stripe customer using userId (this would be modified in stripeService)
    const customerId = await stripeService.createOrGetCustomerByUserId(userId);

    // Create a new subscription in our database
    const subscription = new Subscription({
      userId,
      planId,
      status: "active",
      startDate: new Date(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      tokens: plan.tokens || 0,
      stripeCustomerId: customerId,
    });

    // If it's a paid plan, create a Stripe subscription
    if (plan.price > 0) {
      // In a real implementation, this would create a Stripe subscription
      // const stripeSubscription = await stripeService.createSubscription({
      //   customerId,
      //   priceId: `price_${planId}` // This would be your actual Stripe price ID
      // });

      // subscription.stripeSubscriptionId = stripeSubscription.id;
      subscription.stripeSubscriptionId = `sub_mock_${Math.random().toString(36).substring(2, 15)}`;
    }

    await subscription.save();

    return {
      plan: plan.name,
      status: subscription.status,
      startDate: subscription.startDate,
      nextBillingDate: subscription.nextBillingDate,
      amount: plan.price || 0,
      currency: plan.currency || "USD",
      tokens: subscription.tokens,
    };
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw new Error(`Failed to update subscription: ${error.message}`);
  }
};

/**
 * Purchase a token top-up package
 * @param {string} userId - The ID of the user
 * @param {string} packageId - The ID of the top-up package
 * @returns {Promise<Object>} Result of the top-up operation
 */
const purchaseTopUp = async (userId, packageId) => {
  try {
    // In a real implementation, this would validate the package ID against available packages
    // and process the payment through Stripe

    // Get the current subscription
    let subscription = await Subscription.findOne({ userId }).sort({
      createdAt: -1,
    });

    if (!subscription) {
      // Create a free subscription if none exists
      subscription = new Subscription({
        userId,
        planId: "free",
        status: "active",
        startDate: new Date(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        tokens: 0,
      });
    }

    // Mock top-up packages
    const packages = {
      "topup-50": 10000000,
      "topup-100": 20000000,
      "topup-200": 40000000,
      "topup-500": 200000000,
      "topup-1000": 300000000,
    };

    const tokens = packages[packageId] || 0;

    // Add tokens to the subscription
    subscription.tokens += tokens;
    await subscription.save();

    return {
      success: true,
      message: "Token top-up purchased successfully",
      tokens,
    };
  } catch (error) {
    console.error("Error purchasing top-up:", error);
    throw new Error(`Failed to purchase token top-up: ${error.message}`);
  }
};

/**
 * Cancel a user's subscription
 * @param {string} userId - The ID of the user
 * @param {string} reason - The reason for cancellation
 * @returns {Promise<Object>} The updated subscription object
 */
const cancelSubscription = async (userId, reason) => {
  try {
    // Find the user's active subscription
    const subscription = await Subscription.findOne({
      userId,
      status: "active",
    }).sort({ createdAt: -1 });

    if (!subscription) {
      throw new Error("No active subscription found");
    }

    // Get the plan details
    const plan = getPlanById(subscription.planId);

    // Calculate the end date (current billing period end)
    const endDate = subscription.nextBillingDate;

    // If there's a Stripe subscription, cancel it
    if (subscription.stripeSubscriptionId) {
      await stripeService.cancelSubscription(subscription.stripeSubscriptionId);
    }

    // Update the subscription status
    subscription.status = "canceled";
    subscription.cancelReason = reason || "User requested cancellation";
    subscription.canceledAt = new Date();
    await subscription.save();

    return {
      plan: plan.name,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: endDate,
      canceledAt: subscription.canceledAt,
      amount: plan.price || 0,
      currency: plan.currency || "USD",
      tokens: subscription.tokens,
    };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw new Error(`Failed to cancel subscription: ${error.message}`);
  }
};

// Add the new function to the exports
module.exports = {
  getAllPlans,
  getPlanById,
  getUserSubscription,
  updateSubscription,
  purchaseTopUp,
  cancelSubscription,
};