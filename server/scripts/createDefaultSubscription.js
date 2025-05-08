/**
 * This script is for development purposes only
 * It creates a default subscription for a user
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const createDefaultSubscription = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Find a user
    const user = await User.findOne();
    
    if (!user) {
      console.log('No users found in the database');
      return;
    }
    
    // Check if user already has a subscription
    const existingSubscription = await Subscription.findOne({ userId: user._id });
    
    if (existingSubscription) {
      console.log('User already has a subscription');
      return;
    }
    
    // Create a default subscription
    const subscription = new Subscription({
      userId: user._id,
      planId: 'pro', // Default to Pro plan
      status: 'active',
      startDate: new Date(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      tokens: 10000000 // 10M tokens
    });
    
    await subscription.save();
    console.log('Default subscription created successfully');
  } catch (error) {
    console.error('Error creating default subscription:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run the script
createDefaultSubscription();