const express = require('express');
const SettingsService = require('../services/settingsService');
const { requireUser } = require('./middleware/auth');

const router = express.Router();

/**
 * Get user settings
 * @route GET /api/settings
 * @access Private
 */
router.get('/', requireUser, async (req, res) => {
  try {
    const settings = await SettingsService.getUserSettings(req.user._id);
    
    return res.status(200).json({
      settings
    });
  } catch (error) {
    console.error(`Error fetching user settings: ${error}`);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Update user settings
 * @route PUT /api/settings
 * @access Private
 */
router.put('/', requireUser, async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings object is required' });
    }
    
    const updatedSettings = await SettingsService.updateUserSettings(req.user._id, settings);
    
    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error(`Error updating user settings: ${error}`);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Get settings descriptions
 * @route GET /api/settings/descriptions
 * @access Private
 */
router.get('/descriptions', requireUser, async (req, res) => {
  try {
    const descriptions = SettingsService.getSettingDescriptions();
    
    return res.status(200).json({
      descriptions
    });
  } catch (error) {
    console.error(`Error fetching setting descriptions: ${error}`);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;