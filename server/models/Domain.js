const mongoose = require('mongoose');

const domainSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  domain: {
    type: String,
    required: true,
    trim: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index to ensure a user can't add the same domain twice
domainSchema.index({ userId: 1, domain: 1 }, { unique: true });

const Domain = mongoose.model('Domain', domainSchema);

module.exports = Domain;