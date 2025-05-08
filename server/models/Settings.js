const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  settings: {
    enableEmailNotifications: {
      type: Boolean,
      default: true
    },
    enableUsageAlerts: {
      type: Boolean,
      default: true
    },
    shareAnonymousData: {
      type: Boolean,
      default: false
    },
    darkModePreference: {
      type: Boolean,
      default: true
    },
    enableApiLogging: {
      type: Boolean,
      default: true
    },
    enableDebugMode: {
      type: Boolean,
      default: false
    },
    autoSaveProjects: {
      type: Boolean,
      default: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp on save
settingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;