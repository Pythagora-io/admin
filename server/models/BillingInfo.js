const mongoose = require("mongoose");

const billingInfoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp on save
billingInfoSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const BillingInfo = mongoose.model("BillingInfo", billingInfoSchema);

module.exports = BillingInfo;
