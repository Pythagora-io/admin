const express = require('express');
const PaymentService = require('../services/paymentService');
const UserService = require('../services/userService');
const { requireUser } = require('./middleware/auth');

const router = express.Router();

// Get payment history for the current user
router.get('/', requireUser, async (req, res) => {
  try {
    console.log(`Fetching payment history for user ID: ${req.user._id}`);

    // Get the user's payment history
    let payments = await PaymentService.getPaymentHistory(req.user._id);

    // If no payments found, try to sync with Stripe
    if (payments.length === 0) {
      console.log(`No payments found, attempting to sync with Stripe for user ID: ${req.user._id}`);
      const user = await UserService.get(req.user._id);
      
      if (user.stripeCustomerId) {
        console.log(`Found Stripe customer ID: ${user.stripeCustomerId}, syncing payments`);
        payments = await PaymentService.syncStripePayments(req.user._id, user.stripeCustomerId);
      } else {
        console.log(`No Stripe customer ID found for user ID: ${req.user._id}`);
      }
    }

    // Format the payments for the frontend
    const formattedPayments = payments.map(payment => ({
      id: payment.stripePaymentId,
      date: payment.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      amount: payment.amount,
      currency: payment.currency,
      description: payment.description,
      status: payment.status,
      receiptUrl: `/api/payments/${payment._id}/receipt`
    }));

    return res.status(200).json({ payments: formattedPayments });
  } catch (error) {
    console.error(`Error fetching payment history: ${error}`);
    return res.status(500).json({ error: error.message });
  }
});

// Get receipt for a specific payment
router.get('/:id/receipt', requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, this would generate a PDF receipt
    // For now, we'll just return a URL
    const receiptData = await PaymentService.getPaymentReceipt(id);
    
    return res.status(200).json(receiptData);
  } catch (error) {
    console.error(`Error generating receipt: ${error}`);
    return res.status(500).json({ error: error.message });
  }
});

// Sync payments from Stripe (could be called manually or on a schedule)
router.post('/sync', requireUser, async (req, res) => {
  try {
    const user = await UserService.get(req.user._id);
    
    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: 'User does not have a Stripe customer ID' });
    }
    
    const payments = await PaymentService.syncStripePayments(user._id, user.stripeCustomerId);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Payments synced successfully',
      count: payments.length
    });
  } catch (error) {
    console.error(`Error syncing payments: ${error}`);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;