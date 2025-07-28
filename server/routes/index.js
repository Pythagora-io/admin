const express = require("express");
const router = express.Router();

// Import the authentication service
const PythagoraAuthService = require("../services/pythagoraAuthService");

// Middleware to verify user authentication
const requireUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const userProfile = await PythagoraAuthService.verifyAccessToken(token);

    if (!userProfile) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = userProfile;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Health check routes
router.get("/", (req, res) => {
  res.json({ message: "Pythagora Admin Portal API is running!" });
});

router.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

// Invoice generation endpoint
router.get('/generate-invoice', requireUser, async (req, res) => {
  try {
    console.log('Generate invoice request:', { query: req.query, userId: req.user?._id });

    const { type, id } = req.query;

    if (!type || !id) {
      console.log('Missing required parameters:', { type, id });
      return res.status(400).json({
        error: 'Both type (payment|subscription) and id are required'
      });
    }

    if (!['payment', 'subscription'].includes(type)) {
      console.log('Invalid type parameter:', type);
      return res.status(400).json({
        error: 'Type must be either "payment" or "subscription"'
      });
    }

    // Import the invoice service
    const InvoiceService = require('../services/invoiceService');

    // Generate invoice URL via Pythagora API
    const invoiceUrl = await InvoiceService.generateInvoiceUrl(req.user._id, type, id);

    console.log('Invoice URL generated successfully:', { type, id, url: invoiceUrl });

    res.status(200).json({
      success: true,
      url: invoiceUrl
    });

  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate invoice'
    });
  }
});

// Cancel subscription endpoint
router.post('/stripe/cancel-subscription', requireUser, async (req, res) => {
  try {
    console.log('Cancel subscription request from user:', req.user?._id);

    // Import the subscription service
    const subscriptionService = require('../services/subscriptionService');

    // Cancel the user's subscription
    const result = await subscriptionService.cancelSubscription(req.user._id, 'User requested cancellation');

    console.log('Subscription cancelled successfully for user:', req.user._id);

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: result
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel subscription'
    });
  }
});

module.exports = router;