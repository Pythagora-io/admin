const express = require("express");
const router = express.Router();
const subscriptionService = require("../services/subscriptionService");
const stripeService = require("../services/stripeService");
const { requireUser } = require("./middleware/auth");

/**
 * @route GET /api/subscription/plans
 * @desc Get all available subscription plans
 * @access Public
 */
router.get("/plans", (req, res) => {
  try {
    const plans = subscriptionService.getAllPlans();
    res.status(200).json({ plans });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    res.status(500).json({ error: "Failed to fetch subscription plans" });
  }
});

/**
 * @route GET /api/subscription/plans/:id
 * @desc Get a specific subscription plan by ID
 * @access Public
 */
router.get("/plans/:id", (req, res) => {
  try {
    const { id } = req.params;
    const plan = subscriptionService.getPlanById(id);

    if (!plan) {
      return res.status(404).json({ error: "Subscription plan not found" });
    }

    res.status(200).json({ plan });
  } catch (error) {
    console.error("Error fetching subscription plan:", error);
    res.status(500).json({ error: "Failed to fetch subscription plan" });
  }
});

/**
 * @route GET /api/subscription
 * @desc Get the current user's subscription
 * @access Private
 */
router.get("/", requireUser, async (req, res) => {
  try {
    const subscription = await subscriptionService.getUserSubscription(
      req.user._id,
    );
    res.status(200).json({ subscription });
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch user subscription" });
  }
});

/**
 * @route PUT /api/subscription
 * @desc Update user's subscription
 * @access Private
 */
router.put("/", requireUser, async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }

    const subscription = await subscriptionService.updateSubscription(
      req.user._id,
      planId,
    );

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      subscription,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to update subscription" });
  }
});

/**
 * @route GET /api/subscription/topup
 * @desc Get token top-up packages
 * @access Private
 */
router.get("/topup", requireUser, (req, res) => {
  try {
    // Mock top-up packages
    const packages = [
      {
        id: "topup-50",
        price: 50,
        tokens: 10000000,
        currency: "USD",
      },
      {
        id: "topup-100",
        price: 100,
        tokens: 20000000,
        currency: "USD",
      },
      {
        id: "topup-200",
        price: 200,
        tokens: 40000000,
        currency: "USD",
      },
      {
        id: "topup-500",
        price: 500,
        tokens: 200000000,
        currency: "USD",
      },
      {
        id: "topup-1000",
        price: 1000,
        tokens: 300000000,
        currency: "USD",
      },
    ];

    res.status(200).json({ packages });
  } catch (error) {
    console.error("Error fetching top-up packages:", error);
    res.status(500).json({ error: "Failed to fetch top-up packages" });
  }
});

/**
 * @route POST /api/subscription/topup
 * @desc Purchase token top-up
 * @access Private
 */
router.post("/topup", requireUser, async (req, res) => {
  try {
    const { packageId } = req.body;

    if (!packageId) {
      return res.status(400).json({ error: "Package ID is required" });
    }

    const result = await subscriptionService.purchaseTopUp(
      req.user._id,
      packageId,
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error purchasing top-up:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to purchase token top-up" });
  }
});

/**
 * @route POST /api/subscription/cancel
 * @desc Cancel user's subscription
 * @access Private
 */
router.post("/cancel", requireUser, async (req, res) => {
  try {
    const { reason } = req.body;

    const result = await subscriptionService.cancelSubscription(
      req.user._id,
      reason,
    );

    res.status(200).json({
      success: true,
      message: "Subscription canceled successfully",
      subscription: result,
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to cancel subscription" });
  }
});

module.exports = router;
