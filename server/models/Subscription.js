const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Changed from ObjectId to String since we're using Pythagora user IDs
      required: true,
      index: true,
    },
    planId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "canceled", "expired", "trial"],
      default: "active",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    nextBillingDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    tokens: {
      type: Number,
      default: 0,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
    },
    cancelReason: {
      type: String,
      default: null,
    },
    canceledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;