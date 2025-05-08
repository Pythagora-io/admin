const express = require("express");
const router = express.Router();
const stripeService = require("../services/stripeService");
const { requireUser } = require("./middleware/auth");
const User = require("../models/User");

/**
 * @route GET /api/stripe/config
 * @desc Get Stripe public key
 * @access Public
 */
router.get("/config", async (req, res) => {
  try {
    const config = await stripeService.getStripeConfig();
    res.status(200).json(config);
  } catch (error) {
    console.error("Error getting Stripe config:", error);
    res.status(500).json({ error: "Failed to get Stripe configuration" });
  }
});

/**
 * @route POST /api/stripe/create-payment-intent
 * @desc Create payment intent for subscription
 * @access Private
 */
router.post("/create-payment-intent", requireUser, async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get or create customer
    const customerId = await stripeService.createOrGetCustomer(user);

    // Get plan details to determine amount
    // In a real implementation, you would get the price from your Stripe dashboard
    // or from a plans database
    const planPrices = {
      free: 0,
      pro: 4900, // $49.00 in cents
      premium: 8900, // $89.00 in cents
    };

    const amount = planPrices[planId] || 0;

    if (amount === 0) {
      return res
        .status(400)
        .json({ error: "Invalid plan or free plan selected" });
    }

    const paymentIntent = await stripeService.createPaymentIntent({
      customerId,
      amount,
      currency: "usd",
    });

    res.status(200).json({ clientSecret: paymentIntent.clientSecret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to create payment intent" });
  }
});

/**
 * @route POST /api/stripe/create-topup-payment-intent
 * @desc Create payment intent for token top-up
 * @access Private
 */
router.post("/create-topup-payment-intent", requireUser, async (req, res) => {
  try {
    const { packageId } = req.body;

    if (!packageId) {
      return res.status(400).json({ error: "Package ID is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get or create customer
    const customerId = await stripeService.createOrGetCustomer(user);

    // Get package price
    const packagePrices = {
      "topup-50": 5000, // $50.00 in cents
      "topup-100": 10000, // $100.00 in cents
      "topup-200": 20000, // $200.00 in cents
      "topup-500": 50000, // $500.00 in cents
      "topup-1000": 100000, // $1000.00 in cents
    };

    const amount = packagePrices[packageId];

    if (!amount) {
      return res.status(400).json({ error: "Invalid package selected" });
    }

    const paymentIntent = await stripeService.createPaymentIntent({
      customerId,
      amount,
      currency: "usd",
    });

    res.status(200).json({ clientSecret: paymentIntent.clientSecret });
  } catch (error) {
    console.error("Error creating top-up payment intent:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to create payment intent" });
  }
});

/**
 * @route GET /api/stripe/payment-methods
 * @desc Get user payment methods
 * @access Private
 */
router.get("/payment-methods", requireUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.stripeCustomerId) {
      return res.status(200).json({ paymentMethods: [] });
    }

    const result = await stripeService.getPaymentMethods(user.stripeCustomerId);

    const paymentMethods = result.data.map((pm) => ({
      id: pm.id,
      brand: pm.card.brand,
      last4: pm.card.last4,
      expMonth: pm.card.exp_month,
      expYear: pm.card.exp_year,
      isDefault: pm.metadata?.isDefault || false,
    }));

    res.status(200).json({ paymentMethods });
  } catch (error) {
    console.error("Error getting payment methods:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to get payment methods" });
  }
});

/**
 * @route POST /api/stripe/set-default-payment-method
 * @desc Set default payment method
 * @access Private
 */
router.post("/set-default-payment-method", requireUser, async (req, res) => {
  try {
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ error: "Payment method ID is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.stripeCustomerId) {
      return res
        .status(400)
        .json({ error: "No Stripe customer found for user" });
    }

    await stripeService.setDefaultPaymentMethod(
      user.stripeCustomerId,
      paymentMethodId,
    );

    res.status(200).json({
      success: true,
      message: "Default payment method updated successfully",
    });
  } catch (error) {
    console.error("Error setting default payment method:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to set default payment method" });
  }
});

/**
 * @route DELETE /api/stripe/payment-methods/:id
 * @desc Delete payment method
 * @access Private
 */
router.delete("/payment-methods/:id", requireUser, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Payment method ID is required" });
    }

    await stripeService.deletePaymentMethod(id);

    res.status(200).json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to delete payment method" });
  }
});

module.exports = router;
